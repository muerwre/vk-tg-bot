---
    buttons: [link]
    link_text: Посмотреть сообщение
---
{{!-- 
    use handlebars template here
    available variables are: user, group, text
    (see MessageNewHandler) 
--}}
***Новое сообщение:***
[{{user.first_name}} {{user.last_name}}](https://vk.com/id{{user.id}}) {{#ifEq user.sex 1}}написала{{else}}написал{{/ifEq}}: {{text}}
