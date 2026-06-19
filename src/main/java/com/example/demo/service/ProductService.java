package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    public Product addProduct(Product p){
        return repo.save(p);
    }

    public List<Product> getAllProducts(){
        return repo.findAll();
    }

    public List<Product> saveProductList(List<Product> products){
        return repo.saveAll(products);
    }



    public Product getProductById(Long productId){
        return repo.findById(productId).orElse(null);
    }


    public Product updateProduct(Long id,Product p){
        Product product=repo.findById(id).orElse(null);

        if(product!=null){
            product.setProductName(p.getProductName());
            product.setProductId(p.getProductId());
            product.setPrice(p.getPrice());
            product.setCategory(p.getCategory());
            product.setQuantity(p.getQuantity());

            return repo.save(product);
        }

        return null;
    }

    public String deleteProductById(Long Id){
        repo.deleteById(Id);
        if(getProductById(Id) == null){
            return "Product deleted Successfully";
        }

        return null;

    }



    public List<Product> getProductByCategory(String category){
        return repo.findByCategory(category);
    }



}