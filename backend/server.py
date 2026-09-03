from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

PHONE_RE = re.compile(r'^(?:\+?880|0)1[3-9]\d{8}$')
VALID_COUPONS = {"EDUSOB2026": 0.15}

SEED_COURSES = [
    {
        "id": "mern-fullstack",
        "title": "ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট (MERN)",
        "title_en": "Full-Stack Web Development (MERN)",
        "category": "web",
        "mentor": "তানভীর হাসান",
        "mentor_role": "Ex-Senior Engineer @ Pathao",
        "rating": 4.9,
        "duration_weeks": 24,
        "lessons": 180,
        "enrolled": 3240,
        "batch": "ব্যাচ ১২",
        "level": "বিগিনার টু অ্যাডভান্সড",
        "price": 4999,
        "old_price": 9999,
        "seats_left": 7,
        "syllabus": [
            "HTML, CSS, JavaScript দিয়ে শক্ত ভিত্তি",
            "React ও Next.js দিয়ে মডার্ন ফ্রন্টএন্ড",
            "Node.js, Express ও MongoDB ব্যাকএন্ড",
            "৫টি রিয়েল প্রজেক্ট ও কোড রিভিউ",
            "ইন্টারভিউ প্রিপারেশন ও জব সাপোর্ট",
        ],
    },
    {
        "id": "react-nextjs",
        "title": "ফ্রন্টএন্ড উইথ React ও Next.js",
        "title_en": "Frontend with React & Next.js",
        "category": "web",
        "mentor": "সাব্বির আহমেদ",
        "mentor_role": "Frontend Lead @ ShopUp",
        "rating": 4.8,
        "duration_weeks": 16,
        "lessons": 120,
        "enrolled": 2180,
        "batch": "ব্যাচ ৮",
        "level": "ইন্টারমিডিয়েট",
        "price": 3499,
        "old_price": 6999,
        "seats_left": 14,
        "syllabus": [
            "React hooks ও state management",
            "Next.js App Router ও SSR/SSG",
            "Tailwind CSS ও animation",
            "৩টি পোর্টফোলিও প্রজেক্ট",
        ],
    },
    {
        "id": "ai-ml-python",
        "title": "AI ও মেশিন লার্নিং উইথ Python",
        "title_en": "AI & Machine Learning with Python",
        "category": "ai",
        "mentor": "ড. নুসরাত জাহান",
        "mentor_role": "AI Researcher, Ex-Google",
        "rating": 4.9,
        "duration_weeks": 20,
        "lessons": 150,
        "enrolled": 1890,
        "batch": "ব্যাচ ৬",
        "level": "ইন্টারমিডিয়েট",
        "price": 5999,
        "old_price": 11999,
        "seats_left": 11,
        "syllabus": [
            "Python ও data structures রিফ্রেশার",
            "NumPy, Pandas, visualization",
            "ML algorithms ও model evaluation",
            "Deep learning ও LLM intro",
            "Capstone AI প্রজেক্ট",
        ],
    },
    {
        "id": "data-analytics",
        "title": "ডেটা অ্যানালিটিক্স বুটক্যাম্প",
        "title_en": "Data Analytics Bootcamp",
        "category": "ai",
        "mentor": "রাফি চৌধুরী",
        "mentor_role": "Data Scientist @ bKash",
        "rating": 4.7,
        "duration_weeks": 14,
        "lessons": 96,
        "enrolled": 1420,
        "batch": "ব্যাচ ৫",
        "level": "বিগিনার ফ্রেন্ডলি",
        "price": 4499,
        "old_price": 8999,
        "seats_left": 19,
        "syllabus": [
            "SQL ও Excel মাস্টারি",
            "Python দিয়ে data analysis",
            "Power BI ড্যাশবোর্ড",
            "বাস্তব ব্যবসায়িক কেস স্টাডি",
        ],
    },
    {
        "id": "uiux-masterclass",
        "title": "UI/UX ডিজাইন মাস্টারক্লাস",
        "title_en": "UI/UX Design Masterclass",
        "category": "design",
        "mentor": "মেহজাবিন রহমান",
        "mentor_role": "Lead Product Designer @ Optimizely",
        "rating": 4.9,
        "duration_weeks": 16,
        "lessons": 110,
        "enrolled": 2010,
        "batch": "ব্যাচ ৯",
        "level": "বিগিনার টু প্রো",
        "price": 3999,
        "old_price": 7999,
        "seats_left": 9,
        "syllabus": [
            "Design thinking ও user research",
            "Figma অ্যাডভান্সড ওয়ার্কফ্লো",
            "Design system ও prototyping",
            "কেস স্টাডিসহ পোর্টফোলিও",
        ],
    },
    {
        "id": "digital-marketing",
        "title": "ডিজিটাল মার্কেটিং প্রো",
        "title_en": "Digital Marketing Pro",
        "category": "marketing",
        "mentor": "আরিফুল ইসলাম",
        "mentor_role": "Growth Lead @ 10 Minute School",
        "rating": 4.6,
        "duration_weeks": 12,
        "lessons": 84,
        "enrolled": 2760,
        "batch": "ব্যাচ ১১",
        "level": "বিগিনার ফ্রেন্ডলি",
        "price": 2999,
        "old_price": 5999,
        "seats_left": 22,
        "syllabus": [
            "Facebook ও Google Ads মাস্টারি",
            "SEO ও content strategy",
            "Analytics ও conversion tracking",
            "ফ্রিল্যান্সিং ক্লায়েন্ট পাওয়ার গাইড",
        ],
    },
    {
        "id": "hsc-admission",
        "title": "HSC ও ভর্তি প্রস্তুতি ক্র্যাশ কোর্স",
        "title_en": "HSC & Admission Crash Course",
        "category": "hsc",
        "mentor": "প্রফেসর কামাল উদ্দিন",
        "mentor_role": "ঢাকা বিশ্ববিদ্যালয়",
        "rating": 4.8,
        "duration_weeks": 10,
        "lessons": 120,
        "enrolled": 5230,
        "batch": "ব্যাচ ১৫",
        "level": "HSC ২০২৬ ব্যাচ",
        "price": 1999,
        "old_price": 3999,
        "seats_left": 31,
        "syllabus": [
            "পদার্থ, রসায়ন, গণিত ফুল সিলেবাস",
            "ঢাবি/বুয়েট/মেডিকেল স্পেশাল ব্যাচ",
            "সাপ্তাহিক মডেল টেস্ট",
            "ডাউট সলভিং লাইভ ক্লাস",
        ],
    },
]


class EnrollRequest(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    course_id: str
    coupon: Optional[str] = None


class NewsletterRequest(BaseModel):
    email: EmailStr


@api_router.get("/")
async def root():
    return {"message": "EduSob API running"}


@api_router.get("/courses")
async def list_courses(category: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    courses = await db.courses.find(query, {"_id": 0}).to_list(100)
    if q:
        ql = q.lower()
        courses = [
            c for c in courses
            if ql in c["title"].lower() or ql in c["title_en"].lower() or ql in c["mentor"].lower()
        ]
    return courses


@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@api_router.post("/enroll")
async def enroll(req: EnrollRequest):
    phone = req.phone.replace(" ", "").replace("-", "")
    if not PHONE_RE.match(phone):
        raise HTTPException(status_code=422, detail="সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)")
    course = await db.courses.find_one({"id": req.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not req.name.strip():
        raise HTTPException(status_code=422, detail="নাম দিন")

    discount = 0.0
    coupon = (req.coupon or "").strip().upper()
    if coupon:
        if coupon not in VALID_COUPONS:
            raise HTTPException(status_code=422, detail="কুপন কোডটি সঠিক নয়")
        discount = VALID_COUPONS[coupon]

    price = round(course["price"] * (1 - discount))
    enrollment = {
        "name": req.name.strip(),
        "phone": phone,
        "email": req.email,
        "course_id": course["id"],
        "course_title": course["title"],
        "coupon": coupon or None,
        "discount_percent": int(discount * 100),
        "price_paid": price,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    insert_doc = dict(enrollment)
    result = await db.enrollments.insert_one(insert_doc)
    enrollment["id"] = str(result.inserted_id)
    return enrollment


@api_router.post("/newsletter")
async def newsletter(req: NewsletterRequest):
    await db.newsletter.update_one(
        {"email": req.email},
        {"$set": {"email": req.email, "subscribed_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"message": "subscribed", "email": req.email}


@app.on_event("startup")
async def seed_courses():
    if await db.courses.count_documents({}) == 0:
        await db.courses.insert_many([dict(c) for c in SEED_COURSES])


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
