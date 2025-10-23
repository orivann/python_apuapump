import os
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict

from flask import Flask, render_template


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


app = Flask(__name__)


def base_context(page_id: str) -> Dict[str, Any]:
    """Shared template context with metadata for every page."""
    return {
        "page_id": page_id,
        "supabase": asdict(SUPABASE_CONFIG),
        "chatbot": asdict(CHATBOT_CONFIG),
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


@app.route('/')
def index():
    return render_template('index.html', **base_context('home'))


@app.route('/products')
def products():
    return render_template('products.html', **base_context('products'))


@app.route('/contact')
def contact():
    return render_template('contact.html', **base_context('contact'))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
