package com.example.demo.service;

import com.example.demo.entity.Customer;
import com.example.demo.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class CustomerService {

    @Autowired
    private CustomerRepository repository;

    public List<Customer> getAllCustomers(){
        return repository.findAll();
    }

    public Customer SaveCustomer(Customer customer){
        return repository.save(customer);
    }

    public Customer getCustomerById(Long Id){
        return repository.findById(Id).orElse(null);
    }

    public Customer getCustomerByEmail(String email){
        return repository.findByEmail(email).orElse(null);
    }

    public List<Customer> getCustomerByCity(String City){
        return repository.findByCity(City);
    }

    public List<Customer> getCustomerByAge(int age){
        return repository.findByAgeGreaterThan(age);
    }

}