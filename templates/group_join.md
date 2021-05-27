---
---
{{!-- 
    use handlebars template here
    available variables are: user, group, text, isJoined, isLeave, count
    (see JoinLeaveHandler) 
--}}
😃 [{{user.first_name}} {{user.last_name}}](https://vk.com/id{{user.id}}) {{#ifEq user.sex 1}}присоединилась{{else}}присоединился{{/ifEq}} к группе. Участники: {{count}}. 
