package com.revshop.product.service;

import com.revshop.product.dto.ProductDto;
import com.revshop.product.entity.*;
import com.revshop.product.exception.ResourceNotFoundException;
import com.revshop.product.exception.UnauthorizedException;
import com.revshop.product.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final ReviewRepository reviewRepo;
    private final RatingRepository ratingRepo;

    @Transactional
    public ProductDto.ProductResponse createProduct(ProductDto.CreateProductRequest req, Long sellerId, String sellerName) {
        Category category = categoryRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + req.getCategoryId()));

        Product product = Product.builder()
                .name(req.getName()).description(req.getDescription())
                .price(req.getPrice()).originalPrice(req.getOriginalPrice())
                .stock(req.getStock()).imageUrl(req.getImageUrl())
                .imageUrls(req.getImageUrls() != null ? req.getImageUrls() : List.of())
                .brand(req.getBrand()).category(category)
                .sellerId(sellerId).sellerName(sellerName)
                .lowStockThreshold(req.getLowStockThreshold())
                .active(true).build();

        return mapToResponse(productRepo.save(product));
    }

    @Transactional
    public ProductDto.ProductResponse updateProduct(Long id, ProductDto.UpdateProductRequest req, Long sellerId) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        if (!product.getSellerId().equals(sellerId))
            throw new UnauthorizedException("You don't own this product");

        if (req.getName() != null) product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getPrice() != null) product.setPrice(req.getPrice());
        if (req.getOriginalPrice() != null) product.setOriginalPrice(req.getOriginalPrice());
        if (req.getStock() != null) product.setStock(req.getStock());
        if (req.getImageUrl() != null) product.setImageUrl(req.getImageUrl());
        if (req.getImageUrls() != null) product.setImageUrls(req.getImageUrls());
        if (req.getBrand() != null) product.setBrand(req.getBrand());
        if (req.getCategoryId() != null) {
            Category cat = categoryRepo.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(cat);
        }
        if (req.getLowStockThreshold() != null) product.setLowStockThreshold(req.getLowStockThreshold());
        if (req.getActive() != null) product.setActive(req.getActive());

        return mapToResponse(productRepo.save(product));
    }

    @Transactional
    public void deleteProduct(Long id, Long sellerId) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        if (!product.getSellerId().equals(sellerId))
            throw new UnauthorizedException("You don't own this product");
        product.setActive(false);
        productRepo.save(product);
    }

    public Page<ProductDto.ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepo.findByActiveTrue(pageable).map(this::mapToResponse);
    }

    public Page<ProductDto.ProductResponse> searchProducts(ProductDto.ProductSearchRequest req) {
        Sort sort = req.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(req.getSortBy()).ascending() : Sort.by(req.getSortBy()).descending();
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);
        return productRepo.searchWithFilters(req.getCategoryId(), req.getMinPrice(),
                req.getMaxPrice(), req.getBrand(), req.getKeyword(), pageable).map(this::mapToResponse);
    }

    public ProductDto.ProductResponse getProductById(Long id) {
        return mapToResponse(productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id)));
    }

    public Page<ProductDto.ProductResponse> getSellerProducts(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepo.findBySellerIdAndActiveTrue(sellerId, pageable).map(this::mapToResponse);
    }

    public List<ProductDto.ProductResponse> getLowStockProducts(Long sellerId) {
        return productRepo.findLowStockBySeller(sellerId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductDto.ReviewResponse addReview(Long productId, Long buyerId, String buyerName,
                                               ProductDto.ReviewRequest req) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = Review.builder()
                .product(product).buyerId(buyerId)
                .buyerName(buyerName).comment(req.getComment()).build();

        Review saved = reviewRepo.save(review);
        return mapReview(saved);
    }

    @Transactional
    public void addRating(Long productId, Long buyerId, ProductDto.RatingRequest req) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Rating rating = ratingRepo.findByProductIdAndBuyerId(productId, buyerId)
                .orElseGet(() -> Rating.builder().product(product).buyerId(buyerId).build());
        rating.setScore(req.getScore());
        ratingRepo.save(rating);

        Double avg = ratingRepo.findAverageRating(productId);
        long count = ratingRepo.countByProductId(productId);
        product.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setRatingCount((int) count);
        productRepo.save(product);
    }

    public List<ProductDto.ReviewResponse> getProductReviews(Long productId) {
        return reviewRepo.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::mapReview).collect(Collectors.toList());
    }

    public List<ProductDto.CategoryDto> getAllCategories() {
        return categoryRepo.findAll().stream().map(cat -> {
            ProductDto.CategoryDto dto = new ProductDto.CategoryDto();
            dto.setId(cat.getId());
            dto.setName(cat.getName());
            dto.setDescription(cat.getDescription());
            dto.setImageUrl(cat.getImageUrl());
            dto.setIconClass(cat.getIconClass());
            dto.setProductCount(cat.getProducts().stream().filter(Product::isActive).count());
            return dto;
        }).collect(Collectors.toList());
    }

    // Stock management - called via Feign from order-service
    @Transactional
    public void decreaseStock(Long productId, int quantity) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        if (product.getStock() < quantity)
            throw new IllegalStateException("Insufficient stock for product: " + productId);
        product.setStock(product.getStock() - quantity);
        productRepo.save(product);
    }

    @Transactional
    public void increaseStock(Long productId, int quantity) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        product.setStock(product.getStock() + quantity);
        productRepo.save(product);
    }

    private ProductDto.ProductResponse mapToResponse(Product p) {
        ProductDto.ProductResponse r = new ProductDto.ProductResponse();
        r.setId(p.getId()); r.setName(p.getName()); r.setDescription(p.getDescription());
        r.setPrice(p.getPrice()); r.setOriginalPrice(p.getOriginalPrice());
        r.setStock(p.getStock()); r.setImageUrl(p.getImageUrl()); r.setImageUrls(p.getImageUrls());
        r.setBrand(p.getBrand()); r.setSellerId(p.getSellerId()); r.setSellerName(p.getSellerName());
        r.setAverageRating(p.getAverageRating()); r.setRatingCount(p.getRatingCount());
        r.setActive(p.isActive()); r.setLowStockThreshold(p.getLowStockThreshold());
        r.setLowStock(p.getStock() <= p.getLowStockThreshold());
        r.setCreatedAt(p.getCreatedAt());
        if (p.getCategory() != null) {
            r.setCategoryId(p.getCategory().getId());
            r.setCategoryName(p.getCategory().getName());
        }
        return r;
    }

    private ProductDto.ReviewResponse mapReview(Review r) {
        ProductDto.ReviewResponse dto = new ProductDto.ReviewResponse();
        dto.setId(r.getId()); dto.setProductId(r.getProduct().getId());
        dto.setBuyerId(r.getBuyerId()); dto.setBuyerName(r.getBuyerName());
        dto.setComment(r.getComment()); dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
