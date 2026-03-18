package com.revshop.user.service;

import com.revshop.user.dto.AuthDto;
import com.revshop.user.entity.Role;
import com.revshop.user.entity.User;
import com.revshop.user.exception.ResourceNotFoundException;
import com.revshop.user.exception.UserAlreadyExistsException;
import com.revshop.user.repository.RoleRepository;
import com.revshop.user.repository.UserRepository;
import com.revshop.user.security.JwtService;
import com.revshop.user.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
//user service added
    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        Role.ERole eRole = "SELLER".equalsIgnoreCase(request.getRole())
                ? Role.ERole.ROLE_SELLER
                : Role.ERole.ROLE_BUYER;

        Role role = roleRepository.findByName(eRole)
                .orElseGet(() -> roleRepository.save(Role.builder().name(eRole).build()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .enabled(true)
                .roles(Set.of(role))
                .build();

        User saved = userRepository.save(user);
        log.info("User registered: {} with role: {}", saved.getEmail(), eRole);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtService.generateToken(userDetails, saved.getId(), eRole.name());

        return new AuthDto.AuthResponse(token, saved.getId(), saved.getEmail(),
                saved.getFirstName(), saved.getLastName(), eRole.name());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String roleName = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse("ROLE_BUYER");

        String token = jwtService.generateToken((UserDetails) auth.getPrincipal(), user.getId(), roleName);
        log.info("User logged in: {}", user.getEmail());

        return new AuthDto.AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), roleName);
    }

    public AuthDto.UserProfileDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return mapToProfileDto(user);
    }

    public AuthDto.UserProfileDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToProfileDto(user);
    }

    @Transactional
    public AuthDto.UserProfileDto updateProfile(String email, AuthDto.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getPincode() != null) user.setPincode(request.getPincode());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());

        return mapToProfileDto(userRepository.save(user));
    }

    private AuthDto.UserProfileDto mapToProfileDto(User user) {
        AuthDto.UserProfileDto dto = new AuthDto.UserProfileDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setPincode(user.getPincode());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setRole(user.getRoles().stream().findFirst().map(r -> r.getName().name()).orElse(""));
        return dto;
    }
}
