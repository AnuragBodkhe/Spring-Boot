package com.example.demo.repository;

import com.example.demo.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Orders,Long> {

    @Query("""
                 select count(o)
                 from Orders o
                 Where o.customer.customerId=:customerId""")
    Long countOrder();

    @Query("""
                select sum(o.totalPrice)
                from Orders o
                Where o.customer.customerId=:customerId""")
    double totalAmount(Long customerId);


    @Query("""
                select sum(o.totalPrice)
                from Orders o""")
    double totalRevenue();

}