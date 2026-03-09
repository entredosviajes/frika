from django.core.management.base import BaseCommand

from curriculum.models import Question, Topic

SEED_DATA = [
    {
        "name": "Travel",
        "description": "Questions about travel experiences, destinations, and planning trips.",
        "questions": [
            {"text": "Describe a memorable trip you have taken. Where did you go and what did you do?", "proficiency_level": "B1"},
            {"text": "What is your favorite travel destination and why?", "proficiency_level": "A2"},
            {"text": "How do you usually plan your trips? Do you prefer organized tours or independent travel?", "proficiency_level": "B2"},
        ],
    },
    {
        "name": "Business",
        "description": "Questions about workplace situations, negotiations, and presentations.",
        "questions": [
            {"text": "Tell me about your job. What do you do every day?", "proficiency_level": "A2"},
            {"text": "How would you prepare for an important business presentation?", "proficiency_level": "B2"},
            {"text": "Describe a time you had to negotiate something at work. What strategies did you use?", "proficiency_level": "C1"},
        ],
    },
    {
        "name": "Daily Life",
        "description": "Questions about routines, hobbies, and family.",
        "questions": [
            {"text": "What does your typical day look like?", "proficiency_level": "A1"},
            {"text": "What hobbies do you enjoy in your free time?", "proficiency_level": "A2"},
            {"text": "Describe the roles and responsibilities shared among your family members at home.", "proficiency_level": "B1"},
        ],
    },
    {
        "name": "Food & Dining",
        "description": "Questions about cooking, restaurants, and favorite meals.",
        "questions": [
            {"text": "What is your favorite food?", "proficiency_level": "A1"},
            {"text": "Can you describe how to cook a dish from your country?", "proficiency_level": "B1"},
            {"text": "Compare eating at home versus eating at a restaurant. Which do you prefer and why?", "proficiency_level": "B2"},
        ],
    },
    {
        "name": "Health & Wellness",
        "description": "Questions about exercise, mental health, and healthy habits.",
        "questions": [
            {"text": "How often do you exercise? What kind of exercise do you do?", "proficiency_level": "A2"},
            {"text": "What do you do to manage stress in your daily life?", "proficiency_level": "B1"},
        ],
    },
    {
        "name": "Technology",
        "description": "Questions about apps, social media, and digital life.",
        "questions": [
            {"text": "What apps do you use every day?", "proficiency_level": "A1"},
            {"text": "How has social media changed the way people communicate?", "proficiency_level": "B2"},
            {"text": "Do you think technology makes our lives better or worse? Explain your reasoning.", "proficiency_level": "C1"},
        ],
    },
    {
        "name": "Culture & Entertainment",
        "description": "Questions about movies, music, books, and festivals.",
        "questions": [
            {"text": "What kind of music do you like?", "proficiency_level": "A1"},
            {"text": "Tell me about a movie or book that had a big impact on you.", "proficiency_level": "B1"},
            {"text": "Describe a cultural festival or tradition from your country. What makes it special?", "proficiency_level": "B2"},
        ],
    },
    {
        "name": "Education",
        "description": "Questions about learning, school experiences, and career goals.",
        "questions": [
            {"text": "What are you studying or what did you study at school?", "proficiency_level": "A2"},
            {"text": "What are your career goals and how are you working toward them?", "proficiency_level": "B1"},
        ],
    },
    {
        "name": "Environment",
        "description": "Questions about climate, sustainability, and nature.",
        "questions": [
            {"text": "What do you do to help the environment?", "proficiency_level": "A2"},
            {"text": "How has climate change affected your region?", "proficiency_level": "B2"},
            {"text": "Discuss the trade-offs between economic growth and environmental sustainability.", "proficiency_level": "C1"},
        ],
    },
    {
        "name": "Relationships",
        "description": "Questions about friendships, communication, and social skills.",
        "questions": [
            {"text": "Describe your best friend. How did you meet?", "proficiency_level": "A2"},
            {"text": "What qualities do you think are most important in a good friend?", "proficiency_level": "B1"},
            {"text": "How do you handle disagreements with people close to you?", "proficiency_level": "B2"},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with starter topics and questions."

    def handle(self, *args, **options):
        created_topics = 0
        created_questions = 0

        for entry in SEED_DATA:
            topic, topic_created = Topic.objects.get_or_create(
                name=entry["name"],
                defaults={"description": entry["description"]},
            )
            if topic_created:
                created_topics += 1
                self.stdout.write(f"  Created topic: {topic.name}")
            else:
                self.stdout.write(f"  Skipped existing topic: {topic.name}")

            for q in entry["questions"]:
                _, q_created = Question.objects.get_or_create(
                    topic=topic,
                    text=q["text"],
                    defaults={"proficiency_level": q["proficiency_level"]},
                )
                if q_created:
                    created_questions += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created {created_topics} topics and {created_questions} questions."
            )
        )
