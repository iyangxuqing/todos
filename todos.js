Todos = new Mongo.Collection('todos');
Lists = new Meteor.Collection('lists');

if (Meteor.isClient) {
  Template.todos.helpers({
    todos: function(){
      var currentUser = Meteor.userId();
      var currentList = this._id;
      return Todos.find({createdBy: currentUser, listId: currentList}, {sort: {createdAt: -1}});
    }
  });

  Template.addTodo.events({
    'submit form': function(event){
      event.preventDefault();
      var todoName = $("[name='todoName']").val();
      var currentUser = Meteor.userId();
      var currentList = this._id;
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date(),
        listId: currentList,
        createdBy: currentUser
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
      var currentUser = Meteor.userId();
      Lists.insert({
        name: listName,
        createdBy: currentUser
      }, function(error, results){
        Router.go('listPage', {_id: results});
      });
      $('[name=listName]').val('');
    }
  });

  Template.lists.helpers({
    'lists': function(){
      var currentUser = Meteor.userId();
      return Lists.find({createdBy: currentUser}, {sort: {name: 1}});
    }
  });

  Template.register.events({
    'submit form': function(event){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Accounts.createUser({
        email: email,
        password: password
      }, function(error){
        if(error){
          console.log(error.reason);
        } else {
          Router.go("home")
        }
      });
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.login.events({
    'submit form': function(event){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Meteor.loginWithPassword(email, password, function(error){
        if(error){
          console.log(error.reason);
        } else {
          var currentRoute = Router.current().route.getName();
          if(currentRoute == "login"){
            Router.go("home");
        }
        }
      });
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
    var currentUser = Meteor.userId();
    return Lists.findOne({_id: currentList, createdBy: currentUser});
  },
  onRun: function(){
    console.log("You triggered 'onRun' for 'listPage' route.");
    this.next();
  },
  onRerun: function(){
    console.log("You triggered 'onRerun' for 'listPage' route.");
  },
  onBeforeAction: function(){
    console.log("You triggered 'onBeforeAction' for 'listPage' route.");
    var currentUser = Meteor.userId();
    if(currentUser){
      this.next();
    } else {
      this.render("login");
    }
  },
  onAfterAction: function(){
    console.log("You triggered 'onAfterAction' for 'listPage' route.");
  },
  onStop: function(){
    console.log("You triggered 'onStop' for 'listPage' route.");
  }
});
