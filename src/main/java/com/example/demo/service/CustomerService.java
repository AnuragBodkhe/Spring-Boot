package com.example.demo.service;

import com.example.demo.dto.CustomerDto;
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

    public Optional<Customer> getCustomerById(Long id){

        return repository.findById(id);
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

    public List<Customer> saveCustomerList(List<Customer> cust){
        return repository.saveAll(cust);
    }

    public  Customer UpdateCustomer(Long id , Customer cust){
        Customer ExistingCust=repository.findById(id).orElse(null);

        if(ExistingCust !=null){
            ExistingCust.setCustomerId(cust.getCustomerId());
            ExistingCust.setName(cust.getName());
            ExistingCust.setAge(cust.getAge());
            ExistingCust.setEmail(cust.getEmail());
            ExistingCust.setPassword(cust.getPassword());
            ExistingCust.setBankUserName(cust.getBankUserName());
            ExistingCust.setCity(cust.getCity());

            return repository.save(ExistingCust);

        }
        return null;
    }

    public void deleteCustomer(Long Id){
        repository.deleteById(Id);
    }



}