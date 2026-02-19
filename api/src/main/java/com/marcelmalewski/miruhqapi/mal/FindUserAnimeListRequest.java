package com.marcelmalewski.miruhqapi.mal;

// TODO potrzebuje tej klasy?
public record FindUserAnimeListRequest(String status, Integer limit, Integer offset) {
    public static final String DEFAULT_FIELDS = "id,title,main_picture,start_date,num_episodes";

    public static class Status {
        public static final String PLAN_TO_WATCH = "plan_to_watch";

        private Status() {}
    }
}
