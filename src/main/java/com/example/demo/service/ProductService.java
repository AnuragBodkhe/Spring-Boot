package com.example.demo.service;


import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import jakarta.persistence.Id;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public Product addProduct(Product product){
        return repository.save(product);
    }

    public List<Product> addProductList(List<Product> products){
        return repository.findAll();
    }

    public Product getProductById(Long ProductId){
        return repository.findById(Id).orElse(null);
    }

    public Product updateProduct(Long Id, Product product){
        Product product = repository.findById().orElse(null);

        if (product!=null)
            product.setProductName(product.getProductName());
            product.setProductPrice(product.getProductPrice());
            product.setProductQuantity(product.getProductQuantity());
            product.setProductCategory(product.getProductCategory());
            return repository.save(product);
        return null;
    }
}
