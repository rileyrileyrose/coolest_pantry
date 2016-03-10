//
// HTML SETUP METHODS
//

var setNavbar = function () {
  var navbarHtml = "";

  if (localStorage.token === undefined) {
    navbarHtml += "<a class='login nav-link'>Login</a> / ";
    navbarHtml += "<a class='signup nav-link'>Sign Up</a>";
  }

  if (localStorage.token !== undefined) {
    navbarHtml += "<a class='pantry-link nav-link'>My Pantry</a> / ";
    navbarHtml += "<a class='add-item nav-link'>Add Item</a> / ";
    navbarHtml += "<a class='expiring-soon nav-link'>Expiring Soon</a> / ";
    navbarHtml += "<a class='logout nav-link'>Logout</a>";
  }

  $('.navbar').html(navbarHtml);
};

//
// HELPER METHODS
//

// var baseURL = "http://localhost:9393";
var baseURL = "http://api.pocketpantry.org";

var cleanDate = function(dateString) {
  var date = new Date(dateString);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  return month + '/' + day + '/' + year;
};

var storeEachToLocalStorage = function (pantryitemArr) {
  for (var i = 0; i < pantryitemArr.length; i++) {
    var item = pantryitemArr[i];
    localStorage.setItem('pantryitem' + item['id'], JSON.stringify(item));
  }
};

var flashMessage = function (message) {
  $('.flash').show();
  $('.flash').text(message);
};

// 
// SPLASH PAGE
// 

var displaySplash = function () {
  $('.navbar').hide();
  $('.splash').show();
};

//
//  FORM METHODS
//

var clean = function(str) {
  return str.replace('\'', '&#39;');
};
var dirty = function(str) {
  return str.replace('&#39;', '\'');
};

var displayItemForm = function (id) {
  var item = JSON.parse(localStorage.getItem('pantryitem' + id));
  var name, description, portion, quantity, daysToExp, ingredients, submitClass, formClass, headerText;
  if (item !== null) {
    name = clean(item['name']);
    if (item['description' === undefined]) {
      description = '';
    } else {
      description = item['description'];
    }
    portion = item['portion'];
    quantity = item['quantity'];
    if (item['ingredients'] === undefined) {
      ingredients = '';
    } else {
      ingredients = item['ingredients'];
    }
    submitClass = 'edit-item';
    formClass = 'edit-form';
    headerText = 'Edit Item';
  } else {
    name = '';
    description = '';
    portion = '';
    quantity = '';
    ingredients = '';
    submitClass = 'add-item';
    formClass = 'add-form';
    headerText = 'Add Item';
  }
  var formHtml =
    "<form class='"+formClass+"'>" +
      "<fieldset class='form-group'>" +
        "<div class='form-group'>" +
          "<label for='name'> Item Name: </label>" +
          "<input class='form-control' for='name' id='name' type='text' name='name' required value='"+name+"'>" +
        "</div>" +
        "<div class='form-group'>" +
          "<label for='description'>Description: </label>" +
          "<textarea class='form-control for='description' id='description' name='description' value='"+description+"''></textarea>" +
        "</div>" +
        "<div class='form-group'>" +
          "<label for='portion'>Portion Size: </label>" +
          "<div class='form-note'>(i.e. Gallon, Quart, Pint, Cup etc.)</div>" +
          "<input class='form-control' name = 'portion' for='portion' id='portion' required value='"+portion+"'>" +
        "</div>";
        if (formClass === 'add-form') {
          formHtml += "<div class='form-group'>" +
            "<label for='quantity'>Quantity: </label> " +
            "<input class='form-control' for='quantity' id='quantity' type='number' name='quantity' required'>" +
           "</div>";
          formHtml += "<div class='form-group'>" +
            "<label for='time-to-exp'>Time Until Expiration:</label>" +
            "<input class='form-control'for='time-to-exp' id='time-to-exp' type='number' name='time-to-exp' required>" +
            "<select class='form-control' name='exp-unit' id='exp-unit' required>" +
              "<option value='days'>Day(s)</option>" +
              "<option value='months'>Month(s)</option>" +
              "<option value='years'>Year(s)</option>" +
            "</select>" +
          "</div>";
        }
        formHtml +=
        "<div class='form-group'>" +
          "<label for='ingredients'>Ingredients: </label>" +
          "<div class='form-note'>(please separate with a comma)</div>" +
          "<textarea class='form-control' for='ingredients' id='ingredients'  name='ingredients' value='"+ingredients+"'></textarea>" +
         "</div>" +
      "</fieldset>" +
      "<button class='"+submitClass+" btn btn-default' id='"+id+"'>Submit</button>" +
    "</form>";
  $('.form-holder').show();
  $('.form-holder').html(formHtml);
  $('#header').text(headerText);
};

var postForm = function(path, form) {
  var token = localStorage.token;
  $.ajax({
    type: 'POST',
    url: baseURL + path,
    headers: {'Authorization': token},
    data: $(form).serialize(),
    success: function(data) {
      $('.form-holder').hide();
      displayPantry();
      }
    })
  .fail (function(data) {
    console.log(data);
    flashMessage('Uh oh, this failed. Please try again.');
  });
};

var submitItem = function (type, id) {
  var token = localStorage.getItem('token');
  event.preventDefault();
  if (type === 'add') {
    postForm('/api/v1/pantryitems', '.add-form');
  } else if (type === 'edit') {
    postForm('/api/v1/pantryitems/'+ id, '.edit-form');
  }
};

var displayLoginForm = function () {
  var formHtml =
  "<form class='login-form'>" +
    "<fieldset class='form-group'>" +
      "<label for='email'>Email: </label>" +
      "<input class='form-control' for='email' id='email' name='email' type='email'>" +
      "<label for='password'>Password: </label>" +
      "<input class='form-control' for='password' id='password' name='password' type='password'>" +
    "</fieldset>" +
    "<button class='btn btn-default login-button'>Submit</button>" +
  "</form>";
  $('.form-holder').show();
  $('.form-holder').html(formHtml);
  $('#header').text('Login');
};

var submitLogin = function () {
  event.preventDefault();
  $.post(baseURL + '/api/v1/token',
    $('.login-form').serialize())
  .done(function (data) {
    console.log(data);
    if (data['error'] === undefined) {
      localStorage.token = data['token'];
      localStorage.uid = data['uid'];
      localStorage.name = data['name'];
      setNavbar();
      $('.form-holder').hide();
      displayPantry();
    } else {
      console.log(data['error']);
      flashMessage(data['error']);
    }
  })
  .fail(function (data){
    console.log(data);
    console.log('This failed. I should probably do something different here.');
  });
};

var displaySignupForm = function () {
  var formHtml = "<form class='signup-form'>" +
    "<fieldset class='form-group'>" +
      "<label for='name'>Name: </label>" +
      "<input class='form-control' for='name' id='name' name='name' type='text'>" +
      "<label for='email'>Email: </label>" +
      "<input class='form-control' for='email' id='email' name='email' type='email'>" +
      "<label for='password'>Password: </label>" +
      "<input class='form-control' for='password' id='password' name='password' type='password'>" +
      "<label for='password_confirmation'>Password Confirmation: </label>" +
      "<input class='form-control' for='password_confirmation' id='password_confirmation' name='password' type='password'>" +
    "</fieldset>" +
    "<button class='btn btn-default signup-button'>Sign Up</button>" +
  "</form>";
  $('.form-holder').show();
  $('.form-holder').html(formHtml);
  $('#header').text('Sign Up');
};

var submitSignup = function () {
  event.preventDefault();
  $.post(baseURL + '/api/v1/users',
    $('.signup-form').serialize())
  .done(function (data) {
    console.log(data);
    if (data['error'] === undefined) {
      localStorage.token = data['user']['api_token'];
      localStorage.uid = data['user']['id'];
      localStorage.name = data['user']['name'];
      $('.form-holder').hide();
      setNavbar();
      displayPantry();
    } else {
      console.log(data['error']);
    }
  })
  .fail(function (data){
    console.log('failed');
  });
};

// 
// PANTRY DISPLAY METHODS
// 

var displayPantry = function () {
  $('.pantry').show();
  $('.pantry').html("<div class='loading-message'>Hold tight. Your pantry is loading.</div>");
  $('#header').text(localStorage.getItem('name') + "'s Pantry");
  if (localStorage.getItem('pantryitems') !== null) {
    loadPantryLocalStorage();
  }
  loadPantryAPI();
};

var displayItemTable = function (items, divClass) {
  var tableHTML = "";
  tableHTML += "<table class='table table-responsive' id='pantry-table'><th>item</th><th>portion size</th>" +
  "<th>quantity</th>";
  for (i=0; i<items.length;i++) {
    var item = items[i];
    var expDate;
    if (item['expiration_date'] === null) {
      expDate = 'N/A';
    } else {
      expDate = cleanDate(item['expiration_date']);
    }
    tableHTML +=
      "<tr>" +
        "<td class='item_name td-not-button' id="+item['id']+">" + "<a>"+item["name"]+'</a>' + "</td>" +
        "<td class='portion-size td-not-button' id="+item['id']+">" + item["portion"] + "</td>" +
        "<td class='quantity td-not-button' id="+item['id']+">" + item["quantity"] + "</td>" +
      "</tr>";
  }
  if (items.length === 0) {
    tableHTML = "<h3>You don't have any items yet. Add some to get started.</h3>";
  } else {
    tableHTML += "</table>";
  }
  $(divClass).html(tableHTML);
};

var loadPantryLocalStorage = function () {
  displayItemTable(JSON.parse(localStorage.getItem('pantryitems')), '.pantry');
};

var loadPantryAPI = function () {
  var uid = localStorage.uid;
  var token = localStorage.token;

  $.ajax({
    type:"GET",
    headers: {'Authorization': token},
    url: baseURL + "/api/v1/users/" + uid + "/personal_pantry",
    success: function(data) {
      var length = data['pantry_items'].length;
      var itemsArr = [];
      for (i = 0; i < length; i++) {
        var item  = data['pantry_items'][i];
        itemsArr.push(item);
      }
      displayItemTable(data['pantry_items'], '.pantry');

      // reset localStorage to most up-to-date data
      localStorage.setItem('pantryitems', JSON.stringify(itemsArr));
      storeEachToLocalStorage(itemsArr);
    }
  })
  .fail(function (data) {
    console.log("Error, loading from the API failed.");
  });
  
};

// 
//  SHOW PAGE METHODS
// 

var displaySingleItem = function (id, item, ingredients) {
  var ingHtml = "<div class='ingredients-show'>";
  if (ingredients) {
    if (ingredients.length > 0) {
      for (var i = 0; i < ingredients.length -1; i++) {
        ingHtml += ingredients[i]['name'] + ", ";
      }
      ingHtml += ingredients[ingredients.length-1]['name'];
    }
  }
  ingHtml += " </div>";

  var description = "";
  if (item['description'] !== null) {
    description += "<div class='pantryitem-show description-show'>" + item['description'] + "</div>";
  }
  var pantryitemHtml = description +
    "<div class='pantryitem-show quantity-show' id="+id+"> Available Quantity: " + item['quantity'] + "</div>" +
    ingHtml +
    "<button class='add btn btn-default sm-button' id="+id+"> Quick Add </button>" +
    "<button class='show-pantry btn btn-default sm-button'> Back to Pantry </button>" +
    "<button class='consume consume-show btn btn-default sm-button' id="+id+"> Consume </button>" +
    "<div class='row'>" +
      "<div class='col-xs-6'><button class='edit-btn btn btn-default big-button' id="+id+">Edit Item</button></div>" +
      "<div class='col-xs-6'><button class='bulk-add btn btn-default big-button' id="+id+">Bulk Add</button></div>" +
    "</div>";
  $('.pantryitem').html(pantryitemHtml);
};

var viewItem = function (id) {
  // ajax call to get latest data
  $.ajax({
    type: "GET",
    url: baseURL + "/api/v1/pantryitems/" + id,
    headers: {'Authorization': localStorage.token},
    success: function (data) {
      var item = data['pantryitem'];
      var ings = data['ingredients'];
      displaySingleItem(id, item, ings);
    }
  })
  .fail(function(data) {
    console.log("Uh oh, this failed.");
  });
  // hide pantry div, display pantryitem div, set loading message / new header
  $('.pantry').hide();
  $('.expiring').hide();
  $('.pantryitem').show();
  $('.pantryitem').html("<div class='loading-message'>Your item is loading.</div>");

  // get current item from local Storage and set header
  var currItem = JSON.parse(localStorage.getItem('pantryitem' + id));
  $('#header').text(currItem['name']);

  // pull info from localStorage
  displaySingleItem(id, currItem);
};



var addConsumeItem = function(id, action, quantity) {
  // make AJAX call to check data against API
  $.ajax({
    type: "POST",
    url: baseURL + "/api/v1/pantryitems/" + id + "/" + action ,
    headers: {'Authorization': localStorage.token},
    data: 'quantity=' + quantity,
    success: function (data) {
      if (data['error'] === undefined) {
        $('#'+id+'.quantity').text(data['pantryitem']['quantity']);
        $('#'+id+'.quantity-show').text("Available Quantity: "+ data['pantryitem']['quantity']);
        // update localStorage
        var currItem = JSON.parse(localStorage.getItem('pantryitem' + id));
        if (action === 'add') {
          currItem['quantity'] += 1;
        } else if (action === 'consume') {
          currItem['quantity'] -= 1;
        }
        localStorage.setItem('pantryitem' + id, JSON.stringify(currItem));
      } else {
        $('.flash').show();
        $('.flash').text(error['message']);
      }
    }
  })
  .fail(function(data) {
    console.log('This failed.');
    $('.flash').show();
    $('.flash').text("Uh oh, this failed. Please try again.");
  });
};

var displayExpiringSoon = function () {
  var uid = localStorage.uid;
  $('.expiring').show();
  $('#header').text('Expiring Soon');
  expHtml = "";
  $.ajax({
    type: "GET",
    url: baseURL + "/api/v1/users/" + uid + "/expiring_soon",
    headers: {'Authorization': localStorage.token},
    success: function (data) {
      if (data.length === 0) {
        expHtml = "You've got nothing expiring soon. Hooray!";
      } else {
        console.log(data);
        displayItemTable(data, '.expiring');
      }
    }
  })
  .fail(function () {
    console.log('This failed');
  });

  $('.expiring').html(expHtml);
};

// 
// 
// 
//  DOCUMENT READY CODE BELOW
// 
// 
// 

$(document).ready(function () {

  // hide flash div on click if it's been displayed
  $(document).click(function () {
    $('.flash').hide();
  });

  // setup HTML
  $('.flash').hide();
  $('.splash').hide();

  setNavbar();

  if (localStorage.token) {
    displayPantry();
  } else {
    $('.background').hide();
    displaySplash();
  }

  // SPLASH DIV
  $('.splash').on('click', '#splash-login', function () {
    $('.background').show();
    $('.pantry').hide();
    $('.pantryitem').hide();
    $('.splash').hide();
    $('.expiring').hide();
    $('.navbar').show();
    displayLoginForm();
  });

  $('.splash').on('click', '#splash-signup', function () {
    $('.background').show();
    $('.pantry').hide();
    $('.pantryitem').hide();
    $('.splash').hide();
    $('.expiring').hide();
    $('.navbar').show();
    displaySignupForm();
  });


  // NAVBAR DIV

  $('.navbar').on('click', '.login', function () {
    $('.pantry').hide();
    $('.pantryitem').hide();
    $('.expiring').hide();
    displayLoginForm();
  });

  $('.navbar').on('click', '.signup', function () {
    $('.pantry').hide();
    $('.pantryitem').hide();
    $('.expiring').hide();
    displaySignupForm();
  });

  $('.navbar').on('click', '.logout', function () {
    localStorage.clear();
    $('.background').hide();
    setNavbar();
    displaySplash();

  });

  $('.navbar').on('click', '.pantry-link', function () {
    $('.form-holder').hide();
    $('.pantryitem').hide();
    $('.expiring').hide();
    displayPantry();
  });

  $('.navbar').on('click', '.add-item', function () {
    $('.pantry').hide();
    $('.pantryitem').hide();
    $('.expiring').hide();
    displayItemForm();
  });

  $('.navbar').on('click', '.expiring-soon', function () {
    $('.pantry').hide();
    $('.pantryitem').hide();
    $('.form-holder').hide();
    displayExpiringSoon();
  });

  // FORM DIV

  $('.form-holder').on('click', '.login-button', function () {
    submitLogin();
  });

  $('.form-holder').on('click', '.signup-button', function () {
    submitSignup();
  });

  $('.form-holder').on('click', '.add-item', function () {
    submitItem('add');
  });
  $('.form-holder').on('click', '.edit-item', function () {
    var id = $(this).attr('id');
    submitItem('edit', id);
  });

  // PANTRY DIV

  $('.pantry').on('click', '.item_name', function () {
    var id = $(this).attr('id');
    viewItem(id);
  });
  
  $('.pantry').on('click', '.consume', function() {
    var id = $(this).attr('id');
    addConsumeItem(id, 'consume', 1);
  });

  // EXPIRING DIV

  $('.expiring').on('click', '.item_name', function () {
    var id = $(this).attr('id');
    viewItem(id);
  });
  $('.expiring').on('click', '.consume', function() {
    var id = $(this).attr('id');
    addConsumeItem(id, 'consume', 1);
  });

  // PANTRYITEM SHOW DIV

  $('.pantryitem').on('click', '.add', function() {
    var id = $(this).attr('id');
    addConsumeItem(id, 'add', 1);
  });

  $('.pantryitem').on('click', '.consume', function() {
    var id = $(this).attr('id');
    addConsumeItem(id, 'consume', 1);
  });

  $('.pantryitem').on('click', '.show-pantry', function () {
    $('.pantryitem').hide();
    displayPantry();
  });

  $('.pantryitem').on('click', '.bulk-add', function () {
    $('.pantryitem').hide();
    displayPantry();
  });

  $('.pantryitem').on('click', '.edit-btn', function () {
    var id = $(this).attr('id');
    $('.pantryitem').hide();
    displayItemForm(id);
  });


});