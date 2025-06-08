from django.db import models

# Create your models here.
from django.db import models

class StoryMailUser(models.Model):
    # Auth0 user id (sub) is unique
    auth0_id = models.CharField(max_length=128, unique=True)
    name = models.CharField(max_length=128, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    picture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or self.email or self.auth0_id

class Email(models.Model):
    user = models.ForeignKey(StoryMailUser, on_delete=models.CASCADE, related_name='emails')
    from_email = models.EmailField(null=True, blank=True)   
    from_name = models.CharField(max_length=128, blank=True, null=True)
    to_email = models.EmailField(null=True, blank=True)
    subject = models.CharField(max_length=256,null=True, blank=True)
    date = models.DateTimeField(null=True, blank=True)
    text_body = models.TextField(blank=True, null=True)
    html_body = models.TextField(blank=True, null=True)
    raw_json = models.JSONField(null=True, blank=True)  # Store full Postmark payload
    category = models.CharField(max_length=64, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} ({self.date})"

class DigestReport(models.Model):
    user = models.ForeignKey(StoryMailUser, on_delete=models.CASCADE, related_name='reports')
    start_date = models.DateField()
    end_date = models.DateField()
    summary = models.TextField()
    emails = models.ManyToManyField(Email, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Digest for {self.user} ({self.start_date} - {self.end_date})"