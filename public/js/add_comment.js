(function($) {
    $('#error').hidden = true;

    $('#addCommentForm').submit((event) => {
        event.preventDefault();
        const foodId = $('#foodId').val();
        const userId = $('#userId').val();;
        const text = $('#text').val();
        if(!text || text.trim() === '') {
            $('#error').hidden = false;
            $('#error').html('Error: Comment cannot be blank.');
            $('#text').focus();
        } else {
            $('#error').hidden = true;
			var requestConfig = {
				method: 'POST',
				url: '/comments',
                contentType: 'application/json',
                data: JSON.stringify({
                    foodId: foodId,
                    userId: userId,
                    text: text
                })
			};
			$.ajax(requestConfig).then(function(response) {
                $("#addCommentModal").modal('hide');
                $('#noComments').hide();
                $('#commentList').append($(response));
                $('#addCommentForm').trigger('reset');
			});
        }
    });
})(window.jQuery);