"""AquaPump web application entrypoint with SEO-friendly helpers."""

import os
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

from flask import Flask, jsonify, render_template, request, url_for


@dataclass(frozen=True)
class SupabaseConfig:
    """Lightweight holder for Supabase configuration."""

    url: str = ""
    anon_key: str = ""
    contact_table: str = "contact_messages"

    @property
    def is_configured(self) -> bool:
        return bool(self.url and self.anon_key)


def load_supabase_config() -> SupabaseConfig:
    """Load Supabase environment variables once on startup."""
    return SupabaseConfig(
        url=os.getenv("SUPABASE_URL", ""),
        anon_key=os.getenv("SUPABASE_ANON_KEY", ""),
        contact_table=os.getenv("SUPABASE_CONTACT_TABLE", "contact_messages"),
    )


SUPABASE_CONFIG = load_supabase_config()


@dataclass(frozen=True)
class ChatbotConfig:
    """Placeholder configuration for future AI chatbot integration."""

    provider: str = "openai"
    model: str = "gpt-4o-mini"
    api_key_set: bool = False


def load_chatbot_config() -> ChatbotConfig:
    return ChatbotConfig(
        provider=os.getenv("CHATBOT_PROVIDER", "openai"),
        model=os.getenv("CHATBOT_MODEL", "gpt-4o-mini"),
        api_key_set=bool(os.getenv("CHATBOT_API_KEY")),
    )


CHATBOT_CONFIG = load_chatbot_config()

SITE_NAME = "AquaPump"
SITE_URL = os.getenv("SITE_URL", "https://aquapump.example.com")

DEFAULT_META: Dict[str, str] = {
    "title": "AquaPump — Israeli Water Innovation",
    "description": (
        "AquaPump is an Israeli Aquatech Group company delivering premium pumps, "
        "digital twins, and telemetry-ready infrastructure for municipalities, industry, and agriculture."
    ),
    "keywords": (
        "AquaPump, Aquatech Group, Israeli water technology, smart pumps, "
        "digital twin monitoring, energy efficient pumping systems, industrial pumps"
    ),
    "og_type": "website",
    "robots": "index,follow",
    "twitter_card": "summary_large_image",
}

ORGANIZATION_SCHEMA: Dict[str, Any] = {
    "@type": "Organization",
    "name": SITE_NAME,
    "alternateName": "Aquatech Group — AquaPump",
    "legalName": "AquaPump",
    "foundingDate": "1991-01-01",
    "foundingLocation": {
        "@type": "Place",
        "name": "Tel Aviv, Israel",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "IL",
            "addressLocality": "Tel Aviv",
        },
    },
    "sameAs": [
        "https://www.aquatech.co.il/",
    ],
    "parentOrganization": {
        "@type": "Organization",
        "name": "Aquatech Group",
        "url": "https://www.aquatech.co.il/",
    },
    "contactPoint": [
        {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "telephone": "+972-3-912-1234",
            "areaServed": "IL",
            "availableLanguage": ["en", "he"],
        }
    ],
}

WEBSITE_SCHEMA: Dict[str, Any] = {
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
        "@type": "SearchAction",
        "target": f"{SITE_URL.rstrip('/')}/search?q={{search_term_string}}",
        "query-input": "required name=search_term_string",
    },
}

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


def _asset_url(path: str) -> str:
    base = SITE_URL if SITE_URL.endswith("/") else f"{SITE_URL}/"
    relative = url_for("static", filename=path, _external=False).lstrip("/")
    return urljoin(base, relative)


def build_structured_data(logo_url: str, image_url: str) -> List[Dict[str, Any]]:
    organization = {**ORGANIZATION_SCHEMA, "url": SITE_URL, "logo": logo_url, "image": image_url}
    website = {**WEBSITE_SCHEMA, "name": SITE_NAME, "url": SITE_URL}
    return [organization, website]


def base_context(page_id: str, *, meta: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Shared template context with metadata for every page."""

    canonical_url = urljoin(SITE_URL if SITE_URL.endswith("/") else f"{SITE_URL}/", (request.path or "/").lstrip("/"))
    merged_meta = {**DEFAULT_META, **(meta or {})}
    logo_url = _asset_url("img/aquapump-logo-lockup.svg")
    image_url = _asset_url("img/aquapump-logo-badge.svg")

    return {
        "page_id": page_id,
        "supabase": asdict(SUPABASE_CONFIG),
        "chatbot": asdict(CHATBOT_CONFIG),
        "lang": "en",
        "meta": {
            **merged_meta,
            "canonical": merged_meta.get("canonical", canonical_url),
            "og_title": merged_meta.get("og_title", merged_meta.get("title", SITE_NAME)),
            "og_description": merged_meta.get("og_description", merged_meta.get("description", "")),
        },
        "site": {
            "name": SITE_NAME,
            "url": SITE_URL,
            "tagline": "Israeli water technology by Aquatech Group",
            "logo": logo_url,
            "og_image": image_url,
        },
        "structured_data": build_structured_data(logo_url, image_url),
    }


def prepare_contact_record(payload: Dict[str, str]) -> Dict[str, Any]:
    """Shape a contact record for the future Supabase integration layer."""
    record = {
        "name": payload.get("name", "").strip(),
        "phone": payload.get("phone", "").strip(),
        "email": payload.get("email", "").strip(),
        "message": payload.get("message", "").strip(),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }
    return {
        "table": SUPABASE_CONFIG.contact_table,
        "record": record,
        "enabled": SUPABASE_CONFIG.is_configured,
    }


@app.route("/")
def index():
    meta = {
        "title": "AquaPump — Israeli Aquatech Group Water Infrastructure",
        "description": (
            "AquaPump is an Israeli company within the Aquatech Group delivering premium pump systems, "
            "digital twins, and telemetry-ready infrastructure engineered for municipalities, industry, and agriculture."
        ),
        "keywords": (
            "Israeli water infrastructure, Aquatech Group, AquaPump, smart pumps, Supabase integration, "
            "digital twin monitoring, industrial water systems, agriculture pumps"
        ),
    }
    return render_template("index.html", **base_context("home", meta=meta))


@app.route("/products")
def products():
    meta = {
        "title": "AquaPump Products — Smart Pumps from Israel",
        "description": (
            "Explore AquaPump's Israeli-engineered municipal, industrial, and agricultural pump systems with telemetry-ready "
            "controls, digital twins, and Aquatech Group reliability."
        ),
        "keywords": (
            "AquaPump products, Israeli pumps, Aquatech Group solutions, smart pump catalog, industrial booster, wastewater pumps"
        ),
    }
    return render_template("products.html", **base_context("products", meta=meta))


@app.route("/technology")
def technology():
    meta = {
        "title": "AquaPump Technology — Israeli R&D and Digital Innovation",
        "description": (
            "Dive into AquaPump's Israeli-engineered R&D, AI diagnostics, and lifecycle telemetry platform backed by the Aquatech Group."
        ),
        "keywords": (
            "AquaPump technology, Israeli water innovation, Aquatech R&D, digital twin pumps, predictive maintenance"
        ),
    }
    return render_template("technology.html", **base_context("technology", meta=meta))


@app.route("/impact")
def impact():
    meta = {
        "title": "AquaPump Impact — Case Studies and Sustainability Wins",
        "description": (
            "See how AquaPump delivers measurable impact with Israeli-led deployments, case studies, and sustainability achievements across industries."
        ),
        "keywords": (
            "AquaPump impact, Israeli case studies, Aquatech sustainability, water technology metrics"
        ),
    }
    return render_template("impact.html", **base_context("impact", meta=meta))


@app.route("/aquatech-group")
def aquatech_group():
    meta = {
        "title": "Aquatech Group — AquaPump's Israeli Heritage",
        "description": (
            "Discover AquaPump's role inside Israel's Aquatech Group, our heritage, global reach, and careers shaping the future of water technology."
        ),
        "keywords": (
            "Aquatech Group, Israeli water heritage, AquaPump careers, global water solutions"
        ),
    }
    return render_template("aquatech.html", **base_context("aquatech", meta=meta))


@app.route("/contact")
def contact():
    meta = {
        "title": "Contact AquaPump — Israeli Aquatech Group Team",
        "description": (
            "Connect with AquaPump's Israeli engineering team for tailored pump solutions, Supabase-ready telemetry, and "
            "deployment support across the Aquatech Group network."
        ),
        "keywords": (
            "Contact AquaPump, Israeli pump experts, Aquatech Group support, water technology consultation"
        ),
    }
    return render_template("contact.html", **base_context("contact", meta=meta))


@app.route("/health", methods=["GET"])
def health() -> Any:
    """Lightweight readiness probe for container orchestration."""
    payload = {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": SITE_NAME,
    }
    return jsonify(payload)


@app.after_request
def apply_response_headers(response):
    """Add caching and security headers to improve perceived performance."""
    if not response.headers.get("Cache-Control"):
        response.headers["Cache-Control"] = "public, max-age=3600, stale-while-revalidate=60"
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault(
        "Permissions-Policy",
        "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
    )
    return response


@app.context_processor
def inject_globals():
    return {"current_year": datetime.now(timezone.utc).year, "site_name": SITE_NAME}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
