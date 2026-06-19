package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    ProductService service;

    @PostMapping
    public Product addProuct(@RequestBody Product p){
        return service.addProduct(p);
    }

    @PostMapping("/list")
    public List<Product> saveProductsByList(@RequestBody List<Product> products){
        return service.saveProductList(products);
    }

    @GetMapping
    public List<Product> getAllProducts(){
        return service.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id){
        return service.getProductById(id);
    }

    @PutMapping("/{id}")
    public Product UpdateProduct(@PathVariable Long id , @RequestBody Product product){
        return service.updateProduct(id,product);
    }

    @DeleteMapping("/{id}")
    public String deleteProductById(@PathVariable Long id){
        return service.deleteProductById(id);
    }

    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable   String Category){
        return service.getProductByCategory(Category);
    }

}