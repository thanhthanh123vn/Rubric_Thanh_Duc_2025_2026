package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RubricService {

    @Autowired
    private RubricRepository repository;

    public List<Rubric> getAll() {
        return repository.findAll();
    }

    public Rubric getRubricById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Rubric"));
    }

    public Rubric create(Rubric rubric) {
        return repository.save(rubric);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}