'use strict';

module.exports = {
    showMoreUsers: function () {
        var $usersList = $('#users-list');
        $('#show-more-button').on('click', function () {
            $.spinner().start();
            var getUsersURL = $(this).attr('data-url');
            $.ajax({
                url: getUsersURL,
                type: 'get',
                dataType: 'JSON',
                success: function (response) {
                    var users = response.data.data;
                    $('#show-more-button').attr('data-url', response.getUsersURL);
                    if (response.data.page >= response.data.total_pages) {
                        $('#show-more-button').prop('disabled', true);
                    }
                    if (users) {
                        users.forEach(user => {
                            var $userInfoBlock = $('#user-info').clone();
                            $userInfoBlock.find('#user-avatar').prop('src', user.avatar);
                            $userInfoBlock.find('#user-name').text(user.first_name + ' ' + user.last_name);
                            $userInfoBlock.find('#user-email').text(user.email);
                            $usersList.append($userInfoBlock);
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

