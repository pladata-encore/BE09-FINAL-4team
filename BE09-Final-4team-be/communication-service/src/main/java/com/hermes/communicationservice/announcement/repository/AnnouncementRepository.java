package com.hermes.communicationservice.announcement.repository;

import com.hermes.communicationservice.announcement.dto.AnnouncementSummaryDto;
import com.hermes.communicationservice.announcement.entity.Announcement;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

  @Query("SELECT new com.hermes.communicationservice.announcement.dto.AnnouncementSummaryDto(" +
      "a.id, a.title, a.displayAuthor, a.views, " +
      "CAST((SELECT COUNT(c) FROM Comment c WHERE c.announcement.id = a.id) AS int), a.createdAt) " +
      "FROM Announcement a ORDER BY a.id DESC")
  List<AnnouncementSummaryDto> findAllAnnouncementSummary();

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("update Announcement a set a.views = a.views + 1 where a.id = :id")
  int increaseViews(@Param("id") Long id);

  @Query("SELECT a FROM Announcement a LEFT JOIN FETCH a.fileIds WHERE a.id = :id")
  Optional<Announcement> findByIdWithFileIds(@Param("id") Long id);

  @Query("SELECT new com.hermes.communicationservice.announcement.dto.AnnouncementSummaryDto(" +
      "a.id, a.title, a.displayAuthor, a.views, " +
      "CAST((SELECT COUNT(c) FROM Comment c WHERE c.announcement.id = a.id) AS int), a.createdAt) " +
      "FROM Announcement a WHERE a.title LIKE %:keyword% ORDER BY a.id DESC")
  List<AnnouncementSummaryDto> findByTitleContaining(@Param("keyword") String keyword);
}
