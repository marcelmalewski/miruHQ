package com.marcelmalewski.miruhqapi.mal;

public record AnimeMal(Long id, String title, String start_date,
                       Integer num_episodes, MainPicture main_picture) {
}
