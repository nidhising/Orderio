from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from app.models import OrderStatus


# ─────────────────────────── Product Schemas ────────────────────────────

class ProductBase(BaseModel):
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int

    @field_validator("price")
    @classmethod
    def price_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity_in_stock")
    @classmethod
    def qty_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity in stock cannot be negative")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[Decimal] = None
    quantity_in_stock: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity_in_stock")
    @classmethod
    def qty_must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity in stock cannot be negative")
        return v


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ─────────────────────────── Customer Schemas ───────────────────────────

class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# ─────────────────────────── Order Item Schemas ─────────────────────────

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def qty_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Order item quantity must be greater than 0")
        return v


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    product: ProductResponse


# ─────────────────────────── Order Schemas ──────────────────────────────

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

    @field_validator("items")
    @classmethod
    def items_must_not_be_empty(cls, v):
        if not v:
            raise ValueError("Order must contain at least one item")
        return v


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    customer: CustomerResponse
    order_items: List[OrderItemResponse]


class OrderListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    customer: CustomerResponse


# ─────────────────────────── Dashboard Schema ───────────────────────────

class LowStockProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    quantity_in_stock: int


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[LowStockProduct]
