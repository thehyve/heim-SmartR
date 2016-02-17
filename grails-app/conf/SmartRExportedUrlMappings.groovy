class SmartRExportedUrlMappings {

    static mappings = {
        "/$controller/$action?/$id?(.${format})?"{
            constraints {
                // apply constraints here
            }
        }

        "/"(view:"/smartR/index")
        "500"(view:'/error')
    }
}
