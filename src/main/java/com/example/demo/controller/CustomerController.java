package com.example.demo.controller;


import com.example.demo.entity.Customer;
import com.example.demo.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    CustomerService service;


    @GetMapping
    List<Customer> getAllCustomer(){
        return service.getAllCustomers();
    };

    @PostMapping
    Customer saveCustomer(@RequestBody Customer cust){
        return  service.SaveCustomer(cust);
    }

    @GetMapping("/{id}")
    Optional<Customer> getCustomerbyId(@PathVariable Long id){
        return  service.getCustomerById(id);
    }

    @GetMapping("/email/{email}")
    Customer getCustomerByEmail(@PathVariable String email){
        return service.getCustomerByEmail(email);
    }

    @GetMapping("/city/{city}")
    List<Customer> getCustomerByCity(@PathVariable String city){
        return service.getCustomerByCity(city);
    }

    @GetMapping("/age/{age}")
    List<Customer> getCustomerByAge(@PathVariable int age){
        return service.getCustomerByAge(age);
    }

    @PostMapping("/list")
    List<Customer> SaveCustomerByAList(@RequestBody List<Customer> cust){
        return service.saveCustomerList(cust);
    }

    @PutMapping("/{Id}")
    Customer UpdateCustomerById(@PathVariable Long Id , @RequestBody Customer cust){
        return service.UpdateCustomer(Id,cust);
    }

    @DeleteMapping("/{Id}")
    void DeleteCustomerById(@PathVariable  Long Id){
        service.deleteCustomer(Id);
    }


}