var host = "https://wildfly-openappservice.rhcloud.com/SupportRest/rs/support"; //10.0.2.2  //localhost //hyrdlt1299 //49.207.109.196
var vschemaIdValue = '';
var authToken;

var panelSelector;

function autheticateUser() {
    console.info('authenticate');
    $('#loginButton').button("disable");
    //authenticate the user
    var userid = $("#user").val();
    var pass = $("#password").val();
    var authUrl = host + "/auth";
    var data = {
        user: userid,
        pass: pass
    };
    console.error('The auth url ' + authUrl);
    $.ajax({
        global: false,
        url: authUrl,
        type: "POST",
        data: data,
        contentType: "application/x-www-form-urlencoded",
        success: function (data, status, xhr) {
            console.info('success');
            authToken = xhr.getResponseHeader('authToken');
            changePageHeadersAndNavigate('landingPage');
            console.info('The auth token is ' + authToken);

        },
        error: function (xhr, status, error) {
            console.info('Error in authenticate ' + xhr.status + ' ' + status + ' ' + error);
            if (xhr.status == 401) {
                console.info('failure');
                navigator.notification.alert('Invalid login', null,'',null);
                $('#loginButton').button("enable");
            } else {
                navigator.notification.alert('Oops!! Something went wrong', exitApp);
            }
        }
    });

}

function changePageHeadersAndNavigate(page){
    var urlPage = '#' + page; 
     
    if(page=='landingPage'){
        $('#headerPlaceholder h1').html('Support Dashboard');
        
        $('#headerPlaceholder #1').hide();
        $('#headerPlaceholder #2').hide();
        $('#headerPlaceholder #3').hide();
        
    }else if(page == 'client'){
         $('#headerPlaceholder h1').html('View Client Data');
         
          $('#headerPlaceholder #1').hide();
          $('#headerPlaceholder #2').show();
          $('#headerPlaceholder #3').show();
          
    }else if(page == 'errors'){
         $('#headerPlaceholder h1').html('View Application Errors');
         
          $('#headerPlaceholder #1').show();
          $('#headerPlaceholder #2').hide();
          $('#headerPlaceholder #3').show();
          
    }else if(page == 'access'){
        $('#headerPlaceholder h1').html('Provide Access Roles');
        
        $('#headerPlaceholder #1').show();
        $('#headerPlaceholder #2').show();
        $('#headerPlaceholder #3').hide();
        
    }
    
    $('#headerPlaceholder #4').show();
    // panelSelector = urlPage + ' #navpanel';
     
    $(urlPage+"> [data-placeholder='header']").html($('#headerPlaceholder').html());
    $('#headerPlaceholder').hide();
    $('#'+page).trigger("create");
    $(":mobile-pagecontainer").pagecontainer("change", urlPage);
    
}

function navigateToPage(page) {
    var urlPage = '#' + page;
    if (page == 'client') {
        $('#clientId').empty().append('<option value="-1">Choose a Client Id</option>');
        $('#clientId').selectmenu().selectmenu('refresh');
        mobileObj.populateClientJSONList('accessOptions');
        changePageHeadersAndNavigate(page);
    } else if (page == 'errors') {
         $('#logs').empty();
         $('#logs').listview().listview("refresh");
        mobileObj.displayErrorLogs();
        changePageHeadersAndNavigate(page);
    } else if (page == 'access') {
        changePageHeadersAndNavigate(page);
        mobileObj.resetAccessPage();
        
    }
}

function showPanel(){
    panelSelector = location.hash + ' #navpanel';
    console.info('The panel selector '+panelSelector);
    $(panelSelector).panel('open');
}
var mobileObj = {
    resetAccessPage: function () {
       $(':checkbox').prop("checked", false).checkboxradio().checkboxradio("refresh");
       $(':radio').prop("checked", false ).checkboxradio().checkboxradio("refresh");
       $( ":text" ).val('');
    },
    populateClientJSONList: function (page) {
        console.debug('populateClientJSONList = ' + page);
        $.getJSON(host + "/client", function (result) {
                console.debug('client list size '+result.length);
                for (var i = 0; i < result.length; i++) {
                    var userData = result[i];
                    $('#clientId').append('<option value="' + userData.id + '">' + userData.name + '</option>');
                    $("#clientId").selectmenu("refresh");
                }
        });
    },
    
    displayErrorLogs : function(){
        $.getJSON(host + "/logs", function (result) {
                console.debug('logs list size '+result.length);
                for (var i = 0; i < result.length; i++) {
                     var logs = result[i];
                     var li = "<li><label><input type=\"checkbox\" />"+logs.error+"</label></li>";
                     //var li = "<li>"+logs.error+"</li>";
                     $("#logs").append(li);
                    
                }
                 //$("#logs :checkbox").trigger('create');
                 $("#logs :checkbox").checkboxradio().checkboxradio('refresh');
                 $("#logs").listview("refresh");
        });
        
    }
};



function logoutUser(index) {
    console.info('calling logout with index ' + index);
    if (index == 1) {
        var url = host + '/logout';
        $.ajax({
            url: url,
            type: "GET",
            success: function (data, status, xhr) {
                console.info('After successful logout ');
                loadLoginPage();
                console.info('The location is ' + location.href);
            }
        });
    }
}

function loadLoginPage() {
    var u = location.href.replace(location.hash, '');
    console.info(u);
    location.assign(u);
}

function showLogoutPopUp(){
    navigator.notification.confirm('Do you want to logout', logoutUser);
}

