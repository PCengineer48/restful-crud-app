// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    
	// Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
	$('#btnAddUser').on('click', addUser);
	$('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
	$('#userList table tbody').on('click', 'td a.linkupdateuser', changeUserInfo);
	$('#btnCancelUpdateUser').on('click', togglePanels);
	$('#updateUser input').on('change', function(){$(this).addClass('updated')});
	$('#btnUpdateUser').on('click', updateUser);
	populateTable();
});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {
		userListData = data;
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
			tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.fullname + '">' + this.fullname + '</a></td>';
            //tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
			tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td>' + this.phone + '</td>';
			tableContent += '<td>' + this.address + '</td>';
			tableContent += '<td>' + this.age + '</td>';
			tableContent += '<td>' + this.gender + '</td>';
			tableContent += '<td>' + this.university + '</td>';
			tableContent += '<td>' + this.department + '</td>';
			tableContent += '<td>' + this.educationlevel + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">Delete</a>/<a href="#" class="linkupdateuser" rel="' + this._id + '">Update</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisFullName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.fullname; }).indexOf(thisFullName);
	
	// Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
	$('#userInfoEmail').text(thisUserObject.email);
	$('#userInfoPhone').text(thisUserObject.phone);
	$('#userInfoAddress').text(thisUserObject.address);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoUniversity').text(thisUserObject.university);
	$('#userInfoDepartment').text(thisUserObject.department);
	$('#userInfoEducationLevel').text(thisUserObject.educationlevel);
};

function changeUserInfo(event) {
  // 
  event.preventDefault();
  
  // If the addUser panel is visible, hide it and show updateUser panel
  if($('#addUserPanel').is(":visible")){
    togglePanels();
  }
  
  // Get Index of object based on _id value
  var _id = $(this).attr('rel');
  var arrayPosition = userListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(_id);
  
  // Get our User Object
  var thisUserObject = userListData[arrayPosition];

  // Populate Info Box
  $('#updateUserFullname').val(thisUserObject.fullname);
  $('#updateUserEmail').val(thisUserObject.email);
  $('#updateUserPhone').val(thisUserObject.phone);
  $('#updateUserAddress').val(thisUserObject.address);
  $('#updateUserAge').val(thisUserObject.age);
  $('#updateUserGender').val(thisUserObject.gender);
  $('#updateUserUniversity').val(thisUserObject.university);
  $('#updateUserDepartment').val(thisUserObject.department);
  $('#updateUserEducationLevel').val(thisUserObject.educationlevel);
  

  // Put the userID into the REL of the 'update user' block
  $('#updateUser').attr('rel',thisUserObject._id);
};

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
			'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
			'phone': $('#addUser fieldset input#inputUserPhone').val(),
			'address': $('#addUser fieldset input#inputUserAddress').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val(),
			'university': $('#addUser fieldset input#inputUserUniversity').val(),
			'department': $('#addUser fieldset input#inputUserDepartment').val(),
			'educationlevel': $('#addUser fieldset input#inputUserEducationLevel').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

function updateUser(event){

  event.preventDefault();

  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to update this user?');

  // Check and make sure the user confirmed
  if (confirmation === true) {
    // If they did, do our update
 
    //set the _id of the user to be update 
	var _id = $(this).parentsUntil('div').parent().attr('rel');
		  
		//create a collection of the updated fields
	var fieldsToBeUpdated = $('#updateUser input.updated');
		  
		//create an object of the pairs
	var updatedFields = {};
    $(fieldsToBeUpdated).each(function(){
        var key = $(this).attr('placeholder').replace(" ","").toLowerCase();
        var value = $(this).val();
        updatedFields[key]=value;
    })

    // do the AJAX
    $.ajax({
      type: 'PUT',
      url: '/users/updateuser/' + _id,
      data: updatedFields
    }).done(function( response ) {

      // Check for a successful (blank) response
      if (response.msg === '') {
              togglePanels();
      }
      else {
        alert('Error: ' + response.msg);
      }

      // Update the table
      populateTable();

    });

  }
  else {

    // If they said no to the confirm, do nothing
    return false;

  }
};
// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

function togglePanels(){
    $('#addUserPanel').toggle();
    $('#updateUserPanel').toggle();
}