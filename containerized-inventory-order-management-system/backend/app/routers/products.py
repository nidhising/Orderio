from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    return crud.create_product(db=db, product=product)


@router.get("", response_model=List[schemas.ProductResponse])
def list_products(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    """Retrieve all products."""
    return crud.get_products(db=db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific product by ID."""
    return crud.get_product(db=db, product_id=product_id)


@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    """Update product details."""
    return crud.update_product(db=db, product_id=product_id, product_update=product_update)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product."""
    crud.delete_product(db=db, product_id=product_id)
