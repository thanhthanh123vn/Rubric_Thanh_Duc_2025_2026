package hcmuaf.edu.vn.fit.course_service.config;

import hcmuaf.edu.vn.fit.course_service.entity.EducationProgram;
import hcmuaf.edu.vn.fit.course_service.entity.ProgramPlo;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EducationProgramRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.ProgramPloRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.service.ProgramPloService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProgramPloDataInitializer implements CommandLineRunner {
    private final EducationProgramRepository programRepository;
    private final ProgramPloRepository ploRepository;
    private final CourseRepository courseRepository;

    private record SeedPlo(String code, String group, String description) {}

    private static final List<SeedPlo> DEFAULT_PLOS = List.of(
            new SeedPlo("PLO1", "Kiến thức chung", "Vận dụng các kiến thức cơ bản về khoa học tự nhiên, công nghệ thông tin và toán thống kê để tiếp thu học tập các môn cơ sở ngành và tính toán/giải quyết các vấn đề liên quan đến ngành đào tạo."),
            new SeedPlo("PLO2", "Kiến thức chung", "Vận dụng kiến thức cơ bản về khoa học xã hội – nhân văn, chính trị, pháp luật, ngoại ngữ và kỹ năng mềm để tiếp thu học tập các môn cơ sở ngành và giải quyết các vấn đề liên quan đến ngành đào tạo."),
            new SeedPlo("PLO3", "Kiến thức chung", "Vận dụng các kiến thức nền tảng của lĩnh vực CNTT (kiến trúc máy tính, hệ điều hành, mạng máy tính, lập trình, cấu trúc dữ liệu và giải thuật, cơ sở dữ liệu) trong các hoạt động chuyên môn."),
            new SeedPlo("PLO4", "Kiến thức chung", "Vận dụng hiệu quả phương pháp hướng đối tượng và nền tảng lập trình Java trong phát triển hệ thống phần mềm."),
            new SeedPlo("PLO5", "Kiến thức chung", "Áp dụng linh hoạt các kiến thức chuyên ngành CNTT và công nghệ tiên tiến để giải quyết các vấn đề trong thực tế, đặc biệt trong hệ thống thông tin và công nghệ phần mềm."),
            new SeedPlo("PLO6", "Kiến thức nghề nghiệp", "Phân tích, hình thành ý tưởng, thiết kế, hiện thực hóa và triển khai các hệ thống CNTT phù hợp với bối cảnh doanh nghiệp và xã hội."),
            new SeedPlo("PLO7", "Kiến thức nghề nghiệp", "Áp dụng thành thạo các bước trong quy trình phát triển phần mềm đã được thừa nhận."),
            new SeedPlo("PLO8", "Kiến thức nghề nghiệp", "Sử dụng khả năng tư duy và giải quyết vấn đề trong việc xây dựng và tư vấn giải pháp phần mềm, phát hiện, phân tích và giải quyết các vấn đề trong lĩnh vực CNTT."),
            new SeedPlo("PLO9", "Kiến thức nghề nghiệp", "Phát triển các hệ thống thông minh thông qua việc ứng dụng trí tuệ nhân tạo (AI) và dữ liệu lớn (big data)."),
            new SeedPlo("PLO10", "Kỹ năng", "Khả năng làm việc độc lập, làm việc nhóm và giao tiếp hiệu quả trong môi trường làm việc trong nước và quốc tế."),
            new SeedPlo("PLO11", "Thái độ – Ý thức", "Coi trọng các giá trị đạo đức nghề nghiệp và học tập suốt đời."),
            new SeedPlo("PLO12", "Thái độ – Hành vi", "Vận dụng kiến thức về giáo dục thể chất và giáo dục quốc phòng – an ninh trong việc rèn luyện sức khỏe tinh thần, thể chất, ý thức xây dựng và bảo vệ cộng đồng, địa phương, tổ quốc.")
    );

    @Override
    @Transactional
    public void run(String... args) {
        EducationProgram program = programRepository.findByProgramCodeIgnoreCase(ProgramPloService.IT_PROGRAM_CODE)
                .orElseGet(() -> programRepository.save(EducationProgram.builder()
                        .programId("PROGRAM-CNTT")
                        .programCode(ProgramPloService.IT_PROGRAM_CODE)
                        .programName("Chương trình đào tạo Công nghệ thông tin")
                        .description("Chương trình đào tạo của Khoa Công nghệ thông tin")
                        .build()));

        for (SeedPlo seed : DEFAULT_PLOS) {
            if (ploRepository.findByProgramProgramIdAndPloCodeIgnoreCase(program.getProgramId(), seed.code()).isEmpty()) {
                ploRepository.save(ProgramPlo.builder()
                        .ploId("PLO-CNTT-" + seed.code().substring(3))
                        .program(program)
                        .ploCode(seed.code())
                        .ploName(seed.group())
                        .description(seed.description())
                        .build());
            }
        }

        courseRepository.findAll().stream()
                .filter(course -> course.getProgramId() == null || course.getProgramId().isBlank())
                .forEach(course -> {
                    course.setProgramId(program.getProgramId());
                    courseRepository.save(course);
                });
    }
}
