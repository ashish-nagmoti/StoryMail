from django.shortcuts import render
from django.views.generic import RedirectView
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import json
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from custom_auth.authentication import Auth0JWTAuthentication
from .models import StoryMailUser, Email, DigestReport
from django.utils.dateparse import parse_datetime
import os
import requests
from rest_framework.response import Response
import google.generativeai as genai
from datetime import datetime, timedelta
import io
import json
import base64
from django.template.loader import render_to_string

def get_or_create_user_from_email(email, name=None, picture=None):
    user, created = StoryMailUser.objects.get_or_create(
        email=email,
        defaults={
            'name': name or '',
            'picture': picture or '',
            'auth0_id': email,  # fallback if no auth0_id
        }
    )
    return user

# Update UserInfoView to save/update user on login
class UserInfoView(APIView):
    authentication_classes = [Auth0JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = request.user
        # Save or update user in DB
        user, _ = StoryMailUser.objects.update_or_create(
            auth0_id=user_data.get("sub"),
            defaults={
                "name": user_data.get("name"),
                "email": user_data.get("email"),
                "picture": user_data.get("picture"),
            }
        )
        return Response({
            "id": user_data.get("sub"),
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "picture": user_data.get("picture")
        })

# Helper to call Gemini API for summary/category
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
def get_gemini_summary_category(subject, body):
    """
    Uses Google's Gemini AI to categorize and summarize an email
    """
    try:
        # Configure the Gemini API
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Create the model instance
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create the prompt
        prompt = f"""
        Categorize this email and summarize it in 1-2 sentences. 
        Categories must be exactly one of these: productivity, scam, newsletters, work, other.
        
        Subject: {subject}
        Body: {body}
        
        Respond as JSON: {{
          "category": <category>,
          "summary": <summary>
        }}
        """
        
        # Generate the content
        response = model.generate_content(prompt)
        
        try:
            # Parse the JSON response
            import json as pyjson
            # Extract the text content from the response object
            response_text = response.text.strip()
            # Try to locate JSON in the response if there's surrounding text
            print(f"[Gemini] Raw response text: {response_text}...")  # Debugging output
            if '{' in response_text and '}' in response_text:
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                json_str = response_text[json_start:json_end]
                result = pyjson.loads(json_str)
            else:
                result = pyjson.loads(response_text)
                
            # Ensure category is one of our valid categories
            valid_categories = ["productivity", "scam", "newsletters", "work", "other"]
            category = result.get("category", "other").lower()
            if category not in valid_categories:
                category = "other"
                
            return category, result.get("summary")
        except Exception as json_err:
            print("[Gemini] JSON parsing error:", json_err)
            # Fallback if response isn't proper JSON
            return "other", f"Summary unavailable. Content: {response_text[:100]}..." if response_text else "No summary available"
            
    except Exception as e:
        print("[Gemini] Error:", e)
        return "other", "Error generating summary"

class DashboardRedirectView(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        return settings.FRONTEND_URL + '/dashboard/'
    permanent = False

@method_decorator(csrf_exempt, name='dispatch')
class PostmarkInboundView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            data = json.loads(request.body)
            print('[PostmarkInboundView] Received Postmark inbound email:', data)
            # Find user by To email (first recipient)
            to_email = data.get('ToFull', [{}])[0].get('Email')
            user = None
            if to_email:
                user = StoryMailUser.objects.filter(email=to_email).first()
                if not user:
                    user = get_or_create_user_from_email(to_email)
                    print(f'[PostmarkInboundView] Created new user for email: {to_email}')
                else:
                    print(f'[PostmarkInboundView] Found existing user: {user.email}')
            else:
                print('[PostmarkInboundView] Warning: No recipient email found in the inbound email')
            
            # Call Gemini API for summary/category
            print('[PostmarkInboundView] Calling Gemini API with subject:', data.get('Subject', ''))
            category, summary = get_gemini_summary_category(data.get('Subject', ''), data.get('TextBody', ''))
            print(f'[PostmarkInboundView] Gemini API returned category: {category}, summary: {summary[:50]}...')
            
            # Parse the date with a fallback to current time if None
            parsed_date = parse_datetime(data.get('Date'))
            if parsed_date is None:
                from django.utils import timezone
                parsed_date = timezone.now()
                print(f'[PostmarkInboundView] Date parsing failed, using current time: {parsed_date}')
            else:
                print(f'[PostmarkInboundView] Parsed date: {parsed_date}')
            
            # Save email
            email = Email.objects.create(
                user=user,
                from_email=data.get('From'),
                from_name=data.get('FromName'),
                to_email=to_email,
                subject=data.get('Subject'),
                date=parsed_date,
                text_body=data.get('TextBody'),
                html_body=data.get('HtmlBody'),
                raw_json=data,
                category=category,
                summary=summary
            )
            print(f'[PostmarkInboundView] Email saved successfully with ID: {email.id}, category: {category}')
            return JsonResponse({'status': 'ok'})
        except Exception as e:
            print('[PostmarkInboundView] Error:', str(e))
            # Print stack trace for better debugging
            import traceback
            print('[PostmarkInboundView] Stack trace:', traceback.format_exc())
            return JsonResponse({'error': str(e)}, status=400)

class CategoryStatsView(APIView):
    authentication_classes = [Auth0JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = request.user
        from mainlogic.models import StoryMailUser, Email
        user = StoryMailUser.objects.filter(auth0_id=user_data.get("sub")).first()
        categories = ["productivity", "work", "scam", "newsletters", "other"]
        stats = {cat: 0 for cat in categories}
        if user:
            qs = Email.objects.filter(user=user)
            for cat in categories:
                stats[cat] = qs.filter(category=cat).count()
        return Response(stats)

class EmailListView(APIView):
    authentication_classes = [Auth0JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = request.user
        user = StoryMailUser.objects.filter(auth0_id=user_data.get("sub")).first()
        category = request.GET.get("category")
        if category:
            category = category.rstrip("/")  # Remove trailing slash if present
        
        print(f"[EmailListView] Getting emails for user ID: {user_data.get('sub')} - User found: {user is not None}")
        print(f"[EmailListView] Category: '{category}'")
        
        emails = []
        if user and category:
            # Debug: Count emails for this user and for this specific category
            total_emails = Email.objects.filter(user=user).count()
            category_emails = Email.objects.filter(user=user, category=category).count()
            print(f"[EmailListView] Total emails for user: {total_emails}, emails in category '{category}': {category_emails}")
            
            qs = Email.objects.filter(user=user, category=category)
            emails = [
                {
                    "id": email.id,
                    "from_email": email.from_email,
                    "from_name": email.from_name,
                    "to_email": email.to_email,
                    "subject": email.subject,
                    "date": email.date.isoformat(),
                    "text_body": email.text_body,
                    "summary": email.summary,
                }
                for email in qs.order_by("-date")
            ]
        
        print(f"[EmailListView] Returning {len(emails)} emails")
        return Response(emails)

class EmailDetailView(APIView):
    authentication_classes = [Auth0JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, email_id):
        user_data = request.user
        user = StoryMailUser.objects.filter(auth0_id=user_data.get("sub")).first()
        
        if not user:
            return Response({"error": "User not found"}, status=404)
        
        try:
            # Fetch email and ensure it belongs to the requesting user
            email = Email.objects.get(id=email_id, user=user)
            
            # Return serialized email data
            return Response({
                "id": email.id,
                "from_email": email.from_email,
                "from_name": email.from_name,
                "to_email": email.to_email,
                "subject": email.subject,
                "date": email.date.isoformat() if email.date else None,
                "text_body": email.text_body,
                "html_body": email.html_body,
                "summary": email.summary,
                "category": email.category,
            })
        except Email.DoesNotExist:
            return Response({"error": "Email not found or you don't have permission to view it"}, status=404)

class ChatAPIView(APIView):
    authentication_classes = [Auth0JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_data = request.user
        user = StoryMailUser.objects.filter(auth0_id=user_data.get("sub")).first()
        
        if not user:
            return Response({"error": "User not found"}, status=404)
            
        # Get the query from the request
        query = request.data.get('query', '')
        if not query:
            return Response({"error": "No query provided"}, status=400)
            
        try:
            # Configure the Gemini API
            genai.configure(api_key=GEMINI_API_KEY)
            
            # Fetch user's emails to provide context to Gemini
            emails = Email.objects.filter(user=user).order_by('-date')[:50]  # Limit to recent 50 emails
            
            # Create a more user-friendly context with subjects emphasized
            email_context = "\n\n".join([
                f"Email: \"{email.subject}\" (ID: {email.id})\n"
                f"From: {email.from_name} <{email.from_email}>\n"
                f"Date: {email.date}\n"
                f"Category: {email.category}\n"
                f"Summary: {email.summary}\n"
                for email in emails
            ])
            
            # Create the model instance - using a more capable model for chat
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            # Create the prompt with user's emails as context
            system_prompt = f"""
            You are an email assistant that helps users understand and interact with their emails. 
            The user has the following emails (most recent first):
            
            {email_context}
            
            Based on this data, answer the user's query. When referring to emails, primarily use the email subject in quotes,
            followed by the Email ID in parentheses for reference, like this: "Subject of the email" (ID: 123)
            
            If the query asks for a summary of newsletters, provide a concise overview of newsletter emails.
            When mentioning emails, always include both the subject (in quotes) and the ID (in parentheses).
            Keep your answers concise and useful.
            """
            
            # Generate the content using chat format
            chat = model.start_chat(history=[])
            response = chat.send_message(
                system_prompt + f"\n\nUser query: {query}",
                generation_config={"temperature": 0.2}  # Lower temperature for more factual responses
            )
            
            return Response({
                "response": response.text,
                "query": query,
                "emails_processed": len(emails)
            })
            
        except Exception as e:
            print("[ChatAPIView] Error:", str(e))
            import traceback
            print("[ChatAPIView] Stack trace:", traceback.format_exc())
            return Response({"error": f"Error processing query: {str(e)}"}, status=500)

class DigestAPIView(APIView):
    authentication_classes = [Auth0JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_gemini_digest(self, emails):
        """
        Use Gemini API to generate a structured digest of emails
        """
        try:
            # Configure the Gemini API
            genai.configure(api_key=GEMINI_API_KEY)
            
            # Create the model instance
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            # Format emails for the prompt
            email_data = []
            for email in emails:
                email_data.append({
                    "subject": email.subject,
                    "text_body": email.text_body[:200] + "..." if email.text_body and len(email.text_body) > 200 else email.text_body,
                    "from_email": email.from_email,
                    "from_name": email.from_name,
                    "category": email.category,
                    "date": email.date.isoformat() if email.date else "",
                })
            
            # Create the prompt with structured task
            prompt = f"""
            Using the last 7 days of email data for a user:

            1. Summarize the week's emails like a friendly newsletter:
            Make it story-style (e.g., "This week, the user received 12 emails. Notably, a few newsletters stood out...")
            Highlight important or repeated senders, newsletter topics, or patterns.

            2. Pie chart data output:
            Return category counts in the JSON.

            3. Bullet points of highlights:
            3-5 quick highlights (e.g., "Received a job offer from X", "Got 2 new newsletters on AI").

            4. Mind palace idea (optional cluster suggestions):
            Group emails by topics or sender (e.g., "All newsletters from Substack", "3 emails from recruiter@example.com").

            Output Format: Return structured JSON output like:
            {{
              "narrative_summary": "...",
              "category_counts": {{
                "productivity": x,
                "scam": y,
                "newsletters": z,
                "work": w,
                "other": v
              }},
              "highlights": [
                "First highlight",
                "Second highlight",
                "Third highlight"
              ],
              "clusters": {{
                "Cluster Name 1": ["Item 1", "Item 2"],
                "Cluster Name 2": ["Item 3", "Item 4"]
              }}
            }}

            Here are the emails:
            {json.dumps(email_data, indent=2)}
            """
            
            # Generate the content
            response = model.generate_content(prompt)
            
            # Parse the JSON response
            response_text = response.text.strip()
            
            # Try to locate JSON in the response if there's surrounding text
            if '{' in response_text and '}' in response_text:
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                json_str = response_text[json_start:json_end]
                result = json.loads(json_str)
            else:
                result = json.loads(response_text)
                
            return result
        except Exception as e:
            print(f"[DigestAPIView] Error generating digest: {e}")
            import traceback
            print(traceback.format_exc())
            return {
                "narrative_summary": f"Error generating digest: {str(e)}",
                "category_counts": {"error": 1},
                "highlights": ["Error generating digest"],
                "clusters": {}
            }
            
    def generate_pdf(self, digest, digest_data):
        """Generate a PDF report for the digest"""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.graphics.shapes import Drawing
            from reportlab.graphics.charts.piecharts import Pie
            
            buffer = io.BytesIO()
            
            # Create the PDF object
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            
            # Get styles
            styles = getSampleStyleSheet()
            title_style = styles['Heading1']
            heading2_style = styles['Heading2']
            normal_style = styles['Normal']
            
            # Add title
            elements.append(Paragraph(f"Email Digest: {digest.start_date} to {digest.end_date}", title_style))
            elements.append(Spacer(1, 12))
            
            # Add narrative summary
            elements.append(Paragraph("Weekly Summary", heading2_style))
            elements.append(Paragraph(digest_data.get("narrative_summary", "No summary available"), normal_style))
            elements.append(Spacer(1, 12))
            
            # Create a pie chart for category distribution
            if "category_counts" in digest_data and digest_data["category_counts"]:
                elements.append(Paragraph("Email Categories", heading2_style))
                
                # Create drawing for pie chart
                drawing = Drawing(400, 200)
                category_data = digest_data["category_counts"]
                
                # Filter out categories with zero counts
                category_data = {k: v for k, v in category_data.items() if v > 0}
                
                if category_data:
                    # Create the pie chart
                    pie = Pie()
                    pie.x = 150
                    pie.y = 50
                    pie.width = 150
                    pie.height = 150
                    pie.data = list(category_data.values())
                    pie.labels = list(category_data.keys())
                    pie.slices.strokeWidth = 0.5
                    
                    # Add some colors
                    colors_list = [colors.blue, colors.green, colors.red, colors.orange, colors.purple]
                    for i in range(len(category_data)):
                        pie.slices[i].fillColor = colors_list[i % len(colors_list)]
                    
                    drawing.add(pie)
                    elements.append(drawing)
                    elements.append(Spacer(1, 12))
                    
                    # Add a table with the category counts
                    data = [["Category", "Count"]]
                    for category, count in category_data.items():
                        data.append([category.capitalize(), str(count)])
                    
                    table = Table(data, colWidths=[300, 100])
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ]))
                    
                    elements.append(table)
                    elements.append(Spacer(1, 24))
            
            # Add highlights
            if "highlights" in digest_data and digest_data["highlights"]:
                elements.append(Paragraph("Email Highlights", heading2_style))
                for highlight in digest_data["highlights"]:
                    elements.append(Paragraph(f"• {highlight}", normal_style))
                elements.append(Spacer(1, 12))
            
            # Add clusters
            if "clusters" in digest_data and digest_data["clusters"]:
                elements.append(Paragraph("Email Clusters", heading2_style))
                for cluster_name, items in digest_data["clusters"].items():
                    elements.append(Paragraph(cluster_name, styles["Heading3"]))
                    for item in items:
                        elements.append(Paragraph(f"• {item}", normal_style))
                    elements.append(Spacer(1, 6))
            
            # Build the PDF
            doc.build(elements)
            
            # Get the PDF content
            buffer.seek(0)
            return buffer.getvalue()
        
        except Exception as e:
            print(f"[DigestAPIView] Error generating PDF: {e}")
            import traceback
            print(traceback.format_exc())
            return None
            
    def send_digest_email(self, user, digest, pdf_content):
        """Send the digest to the user via email"""
        try:
            if not pdf_content:
                print("[DigestAPIView] No PDF content to send")
                return False
                
            # Get the Postmark server token from settings
            postmark_token = getattr(settings, 'POSTMARK_SERVER_TOKEN', None)
            if not postmark_token:
                print("[DigestAPIView] Postmark token not configured")
                return False
                
            # Format dates for email subject
            start_date_str = digest.start_date.strftime("%b %d")
            end_date_str = digest.end_date.strftime("%b %d, %Y")
                
            # Prepare email data for Postmark
            email_data = {
                "From": "digest@storymail.app",  # Update with your verified sender
                "To": user.email,
                "Subject": f"Your Weekly Email Digest: {start_date_str} - {end_date_str}",
                "TextBody": f"Your weekly email digest is attached. This covers your emails from {start_date_str} to {end_date_str}.",
                "HtmlBody": f"""
                <html>
                <body>
                    <h1>Your Weekly Email Digest</h1>
                    <p>Hello {user.name or 'there'},</p>
                    <p>Attached is your weekly digest of emails from {start_date_str} to {end_date_str}.</p>
                    <p>This report was automatically generated by StoryMail's AI.</p>
                </body>
                </html>
                """,
                "Attachments": [
                    {
                        "Name": f"Email_Digest_{start_date_str}_to_{end_date_str}.pdf",
                        "Content": base64.b64encode(pdf_content).decode('utf-8'),
                        "ContentType": "application/pdf"
                    }
                ]
            }
            
            # Send the email via Postmark API
            response = requests.post(
                "https://api.postmarkapp.com/email",
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Postmark-Server-Token": postmark_token
                },
                json=email_data
            )
            
            if response.status_code == 200:
                print(f"[DigestAPIView] Email sent successfully to {user.email}")
                return True
            else:
                print(f"[DigestAPIView] Failed to send email: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"[DigestAPIView] Error sending email: {e}")
            import traceback
            print(traceback.format_exc())
            return False

    def post(self, request):
        """Generate a weekly digest for the user"""
        user_data = request.user
        user = StoryMailUser.objects.filter(auth0_id=user_data.get("sub")).first()
        
        if not user:
            return Response({"error": "User not found"}, status=404)
        
        try:
            # Get the date range from request or use default (last 7 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
            
            # Override with request dates if provided
            if request.data.get('start_date'):
                start_date = datetime.fromisoformat(request.data.get('start_date').replace('Z', '+00:00'))
            if request.data.get('end_date'):
                end_date = datetime.fromisoformat(request.data.get('end_date').replace('Z', '+00:00'))
            
            # Get emails from the specified date range
            emails = Email.objects.filter(
                user=user,
                date__gte=start_date,
                date__lte=end_date
            ).order_by('-date')
            
            if not emails:
                return Response({"error": "No emails found in the specified date range"}, status=404)
            
            # Generate digest content using Gemini
            digest_data = self.get_gemini_digest(emails)
            
            # Create a new digest report
            digest = DigestReport.objects.create(
                user=user,
                start_date=start_date.date(),
                end_date=end_date.date(),
                summary=json.dumps(digest_data)
            )
            
            # Associate the emails with the digest
            digest.emails.set(emails)
            
            # Generate PDF of the digest
            pdf_content = self.generate_pdf(digest, digest_data)
            
            # Send email with Postmark (if send_email is True in request)
            email_sent = False
            if request.data.get('send_email', False) and pdf_content:
                email_sent = self.send_digest_email(user, digest, pdf_content)
            
            # Convert PDF to base64 for response if requested
            pdf_base64 = None
            if request.data.get('include_pdf', False) and pdf_content:
                pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
            
            return Response({
                "id": digest.id,
                "start_date": digest.start_date,
                "end_date": digest.end_date,
                "digest_data": digest_data,
                "email_count": emails.count(),
                "pdf_included": pdf_base64 is not None,
                "email_sent": email_sent,
                "pdf_base64": pdf_base64
            })
        
        except Exception as e:
            print(f"[DigestAPIView] Error: {e}")
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Error generating digest: {str(e)}"}, status=500)