package com.example.demo.repository;

import com.example.demo.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {

    @Query("""
            select count(o)
            from Orders o
            where o.customer.customerId = :customerId""")
    Long countOrder(@Param("customerId") Long customerId);   // ← was missing

    @Query("""
            select sum(o.totalPrice)
            from Orders o
            where o.customer.customerId = :customerId""")
    Double totalAmount(@Param("customerId") Long customerId); // ← Double (nullable)

    @Query("""
            select sum(o.totalPrice)
            from Orders o""")
    Double totalRevenue(); // ← Double (nullable, safe if table is empty)
}