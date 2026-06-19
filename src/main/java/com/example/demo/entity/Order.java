package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Order {

    private Long orderId;

    private int quantityOrdered;

    private double totalPrice;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private

}
