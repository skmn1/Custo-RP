package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.SupplierDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Supplier;
import com.staffscheduler.api.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository repository;

    // ── Queries ──

    public List<SupplierDto> findAll() {
        return repository.findByIsActiveTrueOrderByNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public SupplierDto findById(UUID id) {
        return toDto(getEntity(id));
    }

    // ── Mutations ──

    @Transactional
    public SupplierDto create(SupplierDto dto) {
        Supplier entity = new Supplier();
        applyDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public SupplierDto update(UUID id, SupplierDto dto) {
        Supplier entity = getEntity(id);
        applyDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        Supplier entity = getEntity(id);
        entity.setIsActive(false);
        repository.save(entity);
    }

    // ── Helpers ──

    Supplier getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id.toString()));
    }

    private void applyDto(Supplier entity, SupplierDto dto) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getContactPerson() != null) entity.setContactPerson(dto.getContactPerson());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getCurrency() != null) entity.setCurrency(dto.getCurrency());
        if (dto.getPaymentTerms() != null) entity.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getLeadTimeDays() != null) entity.setLeadTimeDays(dto.getLeadTimeDays());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
        if (dto.getNotes() != null) entity.setNotes(dto.getNotes());
    }

    private SupplierDto toDto(Supplier s) {
        return SupplierDto.builder()
                .id(s.getId())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .email(s.getEmail())
                .phone(s.getPhone())
                .address(s.getAddress())
                .currency(s.getCurrency())
                .paymentTerms(s.getPaymentTerms())
                .leadTimeDays(s.getLeadTimeDays())
                .isActive(s.getIsActive())
                .notes(s.getNotes())
                .build();
    }
}
