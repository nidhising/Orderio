from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app import models, schemas


# ═══════════════════════════════ Products ═══════════════════════════════

def get_product(db: Session, product_id: int) -> models.Product:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {product_id} not found")
    return product


def get_products(db: Session, skip: int = 0, limit: int = 200) -> List[models.Product]:
    return db.query(models.Product).offset(skip).limit(limit).all()


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{product.sku}' already exists"
        )
    return db_product


def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate) -> models.Product:
    db_product = get_product(db, product_id)
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with that SKU already exists"
        )
    return db_product


def delete_product(db: Session, product_id: int) -> None:
    db_product = get_product(db, product_id)
    db.delete(db_product)
    db.commit()


# ═══════════════════════════════ Customers ══════════════════════════════

def get_customer(db: Session, customer_id: int) -> models.Customer:
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Customer with id {customer_id} not found")
    return customer


def get_customers(db: Session, skip: int = 0, limit: int = 200) -> List[models.Customer]:
    return db.query(models.Customer).offset(skip).limit(limit).all()


def create_customer(db: Session, customer: schemas.CustomerCreate) -> models.Customer:
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    try:
        db.commit()
        db.refresh(db_customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer with email '{customer.email}' already exists"
        )
    return db_customer


def delete_customer(db: Session, customer_id: int) -> None:
    db_customer = get_customer(db, customer_id)
    db.delete(db_customer)
    db.commit()


# ═══════════════════════════════ Orders ═════════════════════════════════

def get_order(db: Session, order_id: int) -> models.Order:
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.order_items).joinedload(models.OrderItem.product),
        )
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with id {order_id} not found")
    return order


def get_orders(db: Session, skip: int = 0, limit: int = 200) -> List[models.Order]:
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.customer))
        .order_by(models.Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_order(db: Session, order_in: schemas.OrderCreate) -> models.Order:
    # Validate customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Customer with id {order_in.customer_id} not found")

    # Lock and validate all products within a single transaction
    total_amount = Decimal("0.00")
    items_data = []

    for item_in in order_in.items:
        # Use with_for_update() to lock the row and prevent race conditions
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item_in.product_id)
            .with_for_update()
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item_in.product_id} not found"
            )

        if product.quantity_in_stock < item_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity_in_stock}, Requested: {item_in.quantity}"
            )

        unit_price = Decimal(str(product.price))
        line_total = unit_price * item_in.quantity
        total_amount += line_total

        items_data.append({
            "product": product,
            "quantity": item_in.quantity,
            "unit_price": unit_price,
            "line_total": line_total,
        })

    try:
        # Create the order
        db_order = models.Order(
            customer_id=order_in.customer_id,
            total_amount=total_amount,
            status=models.OrderStatus.pending,
        )
        db.add(db_order)
        db.flush()  # Get the order ID without committing

        # Create order items and deduct stock
        for item_data in items_data:
            db_item = models.OrderItem(
                order_id=db_order.id,
                product_id=item_data["product"].id,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                line_total=item_data["line_total"],
            )
            db.add(db_item)
            item_data["product"].quantity_in_stock -= item_data["quantity"]

        db.commit()
        db.refresh(db_order)

    except Exception:
        db.rollback()
        raise

    return get_order(db, db_order.id)


def delete_order(db: Session, order_id: int) -> None:
    db_order = get_order(db, order_id)

    # Restore stock for each item
    for item in db_order.order_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(db_order)
    db.commit()


def update_order_status(db: Session, order_id: int, new_status: models.OrderStatus) -> models.Order:
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with id {order_id} not found")
    db_order.status = new_status
    db.commit()
    db.refresh(db_order)
    # Return with customer loaded
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.customer))
        .filter(models.Order.id == order_id)
        .first()
    )


# ═══════════════════════════════ Dashboard ══════════════════════════════

def get_dashboard_summary(db: Session) -> schemas.DashboardSummary:
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = (
        db.query(models.Product)
        .filter(models.Product.quantity_in_stock <= 5)
        .order_by(models.Product.quantity_in_stock.asc())
        .all()
    )

    return schemas.DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=[
            schemas.LowStockProduct(
                id=p.id, name=p.name, sku=p.sku, quantity_in_stock=p.quantity_in_stock
            )
            for p in low_stock
        ],
    )
