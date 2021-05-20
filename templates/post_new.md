---
    image: true
    buttons: [likes,links,more]
    link_text: Пост полностью
    links:
        https://map.vault48.org/: Посмотреть карту
        http://map.vault48.org/: Посмотреть карту
        https://vk.com/album-: Альбом поката
        http://vk.com/album-: Альбом поката
    likes: ['😱','🤔','😃']
    char_limit: 0
    images_limit: 2
---
{{!-- 

    use handlebars template here
    available variables are: text, user, group, type
    (see PostNewHandler)
     
--}}
{{#ifEq type 'suggest'}}
Предложка:

{{/ifEq}}
{{text}}

{{#if user}}
[{{user.first_name}} {{user.last_name}}](https://vk.com/id{{user.id}})
{{/if}}
