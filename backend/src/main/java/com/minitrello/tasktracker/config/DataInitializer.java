package com.minitrello.tasktracker.config;

import com.minitrello.tasktracker.entity.Board;
import com.minitrello.tasktracker.entity.Task;
import com.minitrello.tasktracker.repository.BoardRepository;
import com.minitrello.tasktracker.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * DataInitializer - Seeds the database with production-style boards and tasks
 * if the database is empty on startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;

    public DataInitializer(BoardRepository boardRepository, TaskRepository taskRepository) {
        this.boardRepository = boardRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (boardRepository.count() == 0) {
            log.info("Database is empty. Seeding production-ready demo data...");

            // 1. Seed Boards
            Board boardDev = new Board();
            boardDev.setName("🚀 Software Development");
            boardDev.setDescription("Product development, feature engineering, DevOps, and testing logs.");
            boardDev = boardRepository.save(boardDev);

            Board boardMkt = new Board();
            boardMkt.setName("🎨 Marketing & Design");
            boardMkt.setDescription("Social media assets, promotional content, copywriting, and graphics planning.");
            boardMkt = boardRepository.save(boardMkt);

            // 2. Seed Tasks for Software Development Board
            Task task1 = new Task();
            task1.setTitle("Design Glassmorphism Layout");
            task1.setDescription("Create cohesive CSS variables for glass panels, dark mode shadows, and neon hover indicators.");
            task1.setStatus(Task.TaskStatus.COMPLETED);
            task1.setPriority(Task.TaskPriority.MEDIUM);
            task1.setDueDate(LocalDateTime.now().minusDays(2));
            task1.setBoard(boardDev);
            task1.setTags(Set.of("Design", "Frontend"));
            taskRepository.save(task1);

            Task task2 = new Task();
            task2.setTitle("Configure Spring Security & JWT");
            task2.setDescription("Implement filter chain for JSON Web Token extraction, validation, and authentication endpoints.");
            task2.setStatus(Task.TaskStatus.IN_PROGRESS);
            task2.setPriority(Task.TaskPriority.URGENT);
            task2.setDueDate(LocalDateTime.now().plusDays(2));
            task2.setBoard(boardDev);
            task2.setTags(Set.of("Backend", "Security"));
            taskRepository.save(task2);

            Task task3 = new Task();
            task3.setTitle("Integrate WebSocket Notifications");
            task3.setDescription("Build message handlers to broadcast real-time task updates and activity log additions to open clients.");
            task3.setStatus(Task.TaskStatus.PENDING);
            task3.setPriority(Task.TaskPriority.HIGH);
            task3.setDueDate(LocalDateTime.now().plusDays(7));
            task3.setBoard(boardDev);
            task3.setTags(Set.of("Backend", "Realtime"));
            taskRepository.save(task3);

            // 3. Seed Tasks for Marketing Board
            Task mktTask1 = new Task();
            mktTask1.setTitle("Publish Product Hunt Launch Post");
            mktTask1.setDescription("Prepare launch title, taglines, visual thumbnails, and schedule launch day announcements.");
            mktTask1.setStatus(Task.TaskStatus.IN_PROGRESS);
            mktTask1.setPriority(Task.TaskPriority.HIGH);
            mktTask1.setDueDate(LocalDateTime.now().plusDays(1));
            mktTask1.setBoard(boardMkt);
            mktTask1.setTags(Set.of("Marketing"));
            taskRepository.save(mktTask1);

            Task mktTask2 = new Task();
            mktTask2.setTitle("Design Social Media Banners");
            mktTask2.setDescription("Create Figma boards for LinkedIn and Twitter cover photos and feature update templates.");
            mktTask2.setStatus(Task.TaskStatus.COMPLETED);
            mktTask2.setPriority(Task.TaskPriority.LOW);
            mktTask2.setDueDate(LocalDateTime.now().minusDays(5));
            mktTask2.setBoard(boardMkt);
            mktTask2.setTags(Set.of("Design"));
            taskRepository.save(mktTask2);

            log.info("Database successfully seeded with {} boards and {} tasks.", 
                    boardRepository.count(), taskRepository.count());
        } else {
            log.info("Database already contains data ({} boards). Skipping seed.", boardRepository.count());
        }
    }
}
