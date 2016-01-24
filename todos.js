Todos = new Mongo.Collection('todos');
Lists = new Meteor.Collection('lists');

if (Meteor.isClient) {
  Template.todos.helpers({
    todos: function(){
      var currentList = this._id;
      return Todos.find({listId: currentList}, {sort: {createdAt: -1}});
    }
  });

  Template.addTodo.events({
    'submit form': function(event){
      event.preventDefault();
      var todoName = $("[name='todoName']").val();
      var currentList = this._id;
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date(),
        listId: currentList
      });
      $("[name='todoName']").val('');
    }
  });

  Template.todoItem.events({
    'click .delete-todo': function(event){
      event.preventDefault();
      var documentId = this._id;
      var confirm = window.confirm("Delete this task?");
      if(confirm){
        Todos.remove({_id: documentId});
      }
    },
    'keyup [name=todoItem]': function(event){
      if(event.which==13 || event.which==27){
        $(event.target).blur();
      } else {
        var todoItem = $(event.target).val();
        var documentId = this._id;
        Todos.update({_id: documentId}, {$set: {name: todoItem}});
      }
    },
    'change [type=checkbox]': function(){
      var documentId = this._id;
      var isCompleted = this.completed;
      Todos.update({_id: documentId}, {$set: {completed: !isCompleted}});
    }
  });

  Template.todoItem.helpers({
    checked: function(){
      var isCompleted = this.completed;
      if(isCompleted){
        return "checked";
      } else {
        return "";
      }
    }
  });

  Template.todosCount.helpers({
    totalTodos: function(){
      var currentList = this._id;
      return Todos.find({listId: currentList}).count();
    },
    completedTodos: function(){
      var currentList = this._id;
      return Todos.find({listId: currentList, completed: true}).count();
    }
  });

  Template.addList.events({
    'submit form': function(event){
      event.preventDefault();
      var listName = $('[name=listName]').val();
      Lists.insert({
        name: listName
      }, function(error, results){
        Router.go('listPage', {_id: results});
      });
      $('[name=listName]').val('');
    }
  });

  Template.lists.helpers({
    'lists': function(){
      return Lists.find({}, {sort: {name: 1}});
    }
  });

}

if (Meteor.isServer) {

}

Router.configure({
  layoutTemplate: 'main'
});
Router.route('/register');
Router.route('/login');
Router.route('/', {
  name: 'home',
  template: 'home'
});
Router.route('/list/:_id', {
  name: 'listPage',
  template: 'listPage',
  data: function(){
    var currentList = this.params._id;
    return Lists.findOne({_id: currentList});
  }
});
