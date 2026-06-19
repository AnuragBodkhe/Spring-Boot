package com.example.demo.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.aot.generate.GeneratedTypeReference;

@Entity
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GeneratedTypeReference)
}
