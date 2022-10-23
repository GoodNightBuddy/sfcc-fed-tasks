'use strict';

module.exports = {
    showMoreUsers: function () {
        var page = 2;
        $('.show-more-button').on('click', function () {
            var $usersList = $('div.users-list');
            $.spinner().start();
            var getUsersURL = $('.show-more-button').attr('data-url') + page;
            page++;
            $.ajax({
                url: getUsersURL,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    var users = data.data;
                    if (data.page === data.total_pages) {
                        $('.show-more-button').prop('disabled', true);
                    }
                    if (users) {
                        users.forEach(user => {
                            $usersList.append(`
                            <div class="col-6 col-sm-3 col-lg-2 text-center mb-2 px-1">
                                <div class="m-auto img-block">
                                    <img src="${user.avatar}" class="w-100 h-100" alt="user avatar">
                                </div>
                                <p class="m-0">${user.first_name} ${user.last_name}</p>
                                <p class="m-0">${user.email}</p>
                            </div>`);
                        });
                    }
                    $.spinner().stop();
                },
                error: function (err) {
                    var errorMessage = err.errorMessage || 'Oops, something went wrong...';
                    var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error m-auto ' +
                        'fade show" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                        '<span aria-hidden="true">&times;</span>' +
                        '</button>' + errorMessage + '</div>';

                    $('div.alert-danger').remove();
                    $usersList.append(errorHtml);
                    $.spinner().stop();
                }
            });
        });
    }
};


// module.exports = {
//     showMoreUsers: function () {
//         var page = 2;
//         var $usersList = $('#users-list');
//         $('#show-more-button').on('click', function () {
//             $.spinner().start();
//             var getUsersURL = $('#show-more-button').attr('data-url') + page;
//             page++;
//             $.ajax({
//                 url: getUsersURL,
//                 type: 'get',
//                 dataType: 'JSON',
//                 success: function (response) {
//                     var users = response.data.data;
//                     if (response.data.page === response.data.total_pages) {
//                         $('#show-more-button').prop('disabled', true);
//                     }
//                     if (users) {
//                         users.forEach(user => {
//                             var $userInfoBlock = $('#user-info').clone();
//                             $userInfoBlock.find('#user-avatar').prop('src', user.avatar);
//                             $userInfoBlock.find('#user-name').text(user.first_name + ' ' + user.last_name);
//                             $userInfoBlock.find('#user-email').text(user.email);
//                             $usersList.append($userInfoBlock);
//                         });
//                     }
//                     $.spinner().stop();
//                 },
//                 error: function (err) {
//                     var errorMessage = err.errorMessage || 'Oops, something went wrong...';
//                     var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error m-auto ' +
//                         'fade show" role="alert">' +
//                         '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
//                         '<span aria-hidden="true">&times;</span>' +
//                         '</button>' + errorMessage + '</div>';

//                     $('div.alert-danger').remove();
//                     $usersList.append(errorHtml);
//                     $.spinner().stop();
//                 }
//             });
//             return false;
//         });
//     }
// };

