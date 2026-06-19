package com.example.demo.repository;

import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {

    @Query("select count(o) from Order o where o.customerId = :customerId")
    Long countOrder();

    @Query("select sum(o.totalPrice) from Order o where o.customerId = :customerId")
    double totalAmount(Long customerId);

    @Query("select sum(o.totalPrice) from Order o")
    double totalRevenue();

}
