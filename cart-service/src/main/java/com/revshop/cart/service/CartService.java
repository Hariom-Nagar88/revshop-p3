package com.revshop.cart.service;

import com.revshop.cart.dto.CartDto;
import com.revshop.cart.entity.*;
import com.revshop.cart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository itemRepo;
    private final WishlistRepository wishlistRepo;

    public CartDto.CartResponse getCart(Long buyerId) {
        Cart cart = cartRepo.findByBuyerId(buyerId)
                .orElseGet(() -> cartRepo.save(Cart.builder().buyerId(buyerId).build()));
        return mapCart(cart);
    }

    @Transactional
    public CartDto.CartResponse addToCart(Long buyerId, CartDto.AddToCartRequest req) {
        Cart cart = cartRepo.findByBuyerId(buyerId)
                .orElseGet(() -> cartRepo.save(Cart.builder().buyerId(buyerId).build()));

        CartItem existing = itemRepo.findByCartIdAndProductId(cart.getId(), req.getProductId()).orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + req.getQuantity());
            itemRepo.save(existing);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart).productId(req.getProductId())
                    .productName(req.getProductName()).imageUrl(req.getImageUrl())
                    .price(req.getPrice()).quantity(req.getQuantity())
                    .sellerId(req.getSellerId()).build();
            cart.getItems().add(item);
        }
        return mapCart(cartRepo.save(cart));
    }

    @Transactional
    public CartDto.CartResponse updateItem(Long buyerId, Long itemId, CartDto.UpdateCartItemRequest req) {
        Cart cart = cartRepo.findByBuyerId(buyerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found"));
        if (req.getQuantity() <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(req.getQuantity());
        }
        return mapCart(cartRepo.save(cart));
    }

    @Transactional
    public CartDto.CartResponse removeItem(Long buyerId, Long itemId) {
        Cart cart = cartRepo.findByBuyerId(buyerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        return mapCart(cartRepo.save(cart));
    }

    @Transactional
    public void clearCart(Long buyerId) {
        cartRepo.findByBuyerId(buyerId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepo.save(cart);
        });
    }

    // Wishlist
    @Transactional
    public CartDto.WishlistResponse addToWishlist(Long buyerId, CartDto.WishlistRequest req) {
        if (wishlistRepo.existsByBuyerIdAndProductId(buyerId, req.getProductId())) {
            return getWishlistItems(buyerId).stream()
                    .filter(w -> w.getProductId().equals(req.getProductId())).findFirst()
                    .orElseThrow();
        }
        Wishlist w = wishlistRepo.save(Wishlist.builder()
                .buyerId(buyerId).productId(req.getProductId())
                .productName(req.getProductName()).imageUrl(req.getImageUrl())
                .productPrice(req.getProductPrice()).build());
        return mapWishlist(w);
    }

    @Transactional
    public void removeFromWishlist(Long buyerId, Long productId) {
        wishlistRepo.deleteByBuyerIdAndProductId(buyerId, productId);
    }

    public List<CartDto.WishlistResponse> getWishlistItems(Long buyerId) {
        return wishlistRepo.findByBuyerIdOrderByAddedAtDesc(buyerId)
                .stream().map(this::mapWishlist).collect(Collectors.toList());
    }

    public boolean isInWishlist(Long buyerId, Long productId) {
        return wishlistRepo.existsByBuyerIdAndProductId(buyerId, productId);
    }

    private CartDto.CartResponse mapCart(Cart cart) {
        CartDto.CartResponse r = new CartDto.CartResponse();
        r.setId(cart.getId());
        r.setBuyerId(cart.getBuyerId());
        r.setItems(cart.getItems().stream().map(this::mapItem).collect(Collectors.toList()));
        r.setTotalPrice(cart.getTotalPrice());
        r.setTotalItems(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum());
        return r;
    }

    private CartDto.CartItemResponse mapItem(CartItem i) {
        CartDto.CartItemResponse r = new CartDto.CartItemResponse();
        r.setId(i.getId()); r.setProductId(i.getProductId());
        r.setProductName(i.getProductName()); r.setImageUrl(i.getImageUrl());
        r.setPrice(i.getPrice()); r.setQuantity(i.getQuantity());
        r.setSubtotal(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
        r.setSellerId(i.getSellerId());
        return r;
    }

    private CartDto.WishlistResponse mapWishlist(Wishlist w) {
        CartDto.WishlistResponse r = new CartDto.WishlistResponse();
        r.setId(w.getId()); r.setProductId(w.getProductId());
        r.setProductName(w.getProductName()); r.setImageUrl(w.getImageUrl());
        r.setProductPrice(w.getProductPrice()); r.setAddedAt(w.getAddedAt());
        return r;
    }
}
