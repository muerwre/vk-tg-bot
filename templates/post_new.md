---
    image: true
    buttons: [likes,links]
    link_text: Пост полностью
    links:
        https://map.vault48.org/: Посмотреть карту
        http://map.vault48.org/: Посмотреть карту
        https://vk.com/album-: Альбом поката
        http://vk.com/album-: Альбом поката
    likes: ['😱','🤔','😃']
---
{{!-- 
    use handlebars template here
    available variables are: text, user, group
    (see PostNewHandler) 
--}}
{{text}}

{{#if user}}
-- [{{user.first_name}} {{user.last_name}}](https://vk.com/id{{user.id}})
{{/if}}
