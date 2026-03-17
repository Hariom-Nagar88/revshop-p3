package com.revshop.product.repository;

import com.revshop.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.active = true")
    Page<Product> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.sellerId = :sellerId AND p.active = true")
    Page<Product> findBySellerIdAndActiveTrue(@Param("sellerId") Long sellerId, Pageable pageable);

    List<Product> findBySellerId(Long sellerId);

    @Query("""
        SELECT p FROM Product p WHERE p.active = true AND (
            LOWER(p.name) LIKE LOWER(CONCAT('%',:kw,'%')) OR
            LOWER(p.description) LIKE LOWER(CONCAT('%',:kw,'%')) OR
            LOWER(p.brand) LIKE LOWER(CONCAT('%',:kw,'%'))
        )
    """)
    Page<Product> searchByKeyword(@Param("kw") String keyword, Pageable pageable);

    @Query("""
        SELECT p FROM Product p WHERE p.active = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        AND (:brand IS NULL OR LOWER(p.brand) LIKE LOWER(CONCAT('%',:brand,'%')))
        AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:keyword,'%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%',:keyword,'%')))
    """)
    Page<Product> searchWithFilters(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("brand") String brand,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.active = true")
    Page<Product> findByCategoryIdAndActiveTrue(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.sellerId = :sellerId AND p.stock <= p.lowStockThreshold")
    List<Product> findLowStockBySeller(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.sellerId = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);
}
