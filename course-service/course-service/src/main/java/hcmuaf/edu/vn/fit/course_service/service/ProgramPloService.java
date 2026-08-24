package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.ProgramPloRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ProgramPloResponse;
import hcmuaf.edu.vn.fit.course_service.entity.EducationProgram;
import hcmuaf.edu.vn.fit.course_service.entity.ProgramPlo;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EducationProgramRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.ProgramPloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class ProgramPloService {
    public static final String IT_PROGRAM_CODE = "CNTT";
    private final ProgramPloRepository ploRepository;
    private final EducationProgramRepository programRepository;

    @Transactional(readOnly = true)
    public List<ProgramPloResponse> getAll() {
        EducationProgram program = requireProgram();
        return ploRepository.findByProgramProgramIdOrderByPloCodeAsc(program.getProgramId()).stream()
                .sorted(Comparator.comparingInt(plo -> numericOrder(plo.getPloCode())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProgramPloResponse create(ProgramPloRequest request) {
        EducationProgram program = requireProgram();
        String code = validateAndNormalizeCode(request);
        validateDescription(request);
        if (ploRepository.findByProgramProgramIdAndPloCodeIgnoreCase(program.getProgramId(), code).isPresent()) {
            throw new IllegalArgumentException("Mã PLO " + code + " đã tồn tại.");
        }
        ProgramPlo plo = ProgramPlo.builder()
                .ploId("PLO-" + UUID.randomUUID())
                .program(program)
                .ploCode(code)
                .ploName("Chuẩn đầu ra " + code)
                .description(request.getDescription().trim())
                .build();
        return toResponse(ploRepository.save(plo));
    }

    @Transactional
    public ProgramPloResponse update(String ploId, ProgramPloRequest request) {
        ProgramPlo plo = requirePlo(ploId);
        String code = validateAndNormalizeCode(request);
        validateDescription(request);
        ploRepository.findByProgramProgramIdAndPloCodeIgnoreCase(plo.getProgram().getProgramId(), code)
                .filter(existing -> !existing.getPloId().equals(ploId))
                .ifPresent(existing -> { throw new IllegalArgumentException("Mã PLO " + code + " đã tồn tại."); });
        plo.setPloCode(code);
        plo.setPloName("Chuẩn đầu ra " + code);
        plo.setDescription(request.getDescription().trim());
        return toResponse(ploRepository.save(plo));
    }

    @Transactional
    public void delete(String ploId) {
        ProgramPlo plo = requirePlo(ploId);
        if (!plo.getCourseClos().isEmpty()) {
            throw new IllegalStateException("Không thể xóa " + plo.getPloCode() + " vì PLO đang được CLO liên kết.");
        }
        ploRepository.delete(plo);
    }

    private ProgramPlo requirePlo(String ploId) {
        return ploRepository.findById(ploId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy PLO."));
    }

    private EducationProgram requireProgram() {
        return programRepository.findByProgramCodeIgnoreCase(IT_PROGRAM_CODE)
                .orElseThrow(() -> new IllegalStateException("Chưa cấu hình Chương trình đào tạo CNTT."));
    }

    private String validateAndNormalizeCode(ProgramPloRequest request) {
        if (request == null || request.getPloCode() == null || request.getPloCode().isBlank()) {
            throw new IllegalArgumentException("Mã PLO là bắt buộc.");
        }
        return request.getPloCode().trim().replaceAll("\\s+", "").toUpperCase(Locale.ROOT);
    }

    private void validateDescription(ProgramPloRequest request) {
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new IllegalArgumentException("Mô tả PLO là bắt buộc.");
        }
    }

    private ProgramPloResponse toResponse(ProgramPlo plo) {
        int linked = plo.getCourseClos() == null ? 0 : plo.getCourseClos().size();
        return ProgramPloResponse.builder()
                .ploId(plo.getPloId())
                .programId(plo.getProgram().getProgramId())
                .ploCode(plo.getPloCode())
                .description(plo.getDescription())
                .linkedCloCount(linked)
                .status(linked > 0 ? "MAPPED" : "UNMAPPED")
                .build();
    }

    private int numericOrder(String code) {
        try {
            return Integer.parseInt(code.replaceAll("\\D+", ""));
        } catch (NumberFormatException ignored) {
            return Integer.MAX_VALUE;
        }
    }
}
