package hcmuaf.edu.vn.fit.course_service.service;


import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    public boolean createGroup(GroupRequest req){
        return true;
    }
}
