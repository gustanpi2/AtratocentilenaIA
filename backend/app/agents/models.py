from sqlalchemy import (
    Column, BigInteger, Integer, String, Text, Enum, JSON,
    TIMESTAMP, ForeignKey, Index
)
from sqlalchemy.sql import func

from app.database.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String(255), nullable=False, default="Nueva conversación")
    session_id = Column(String(100), nullable=False)
    status = Column(Enum("active", "archived"), default="active")
    message_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_session", "session_id"),
        Index("idx_updated", "updated_at"),
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(BigInteger, primary_key=True, index=True)
    conversation_id = Column(BigInteger, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum("user", "assistant", "system"), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(20), default="llm")
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        Index("idx_conversation", "conversation_id"),
        Index("idx_msg_created", "created_at"),
    )
