(function($) {
    let counter = 1;
    let foodArray = [];
    let servingArray = [];
    $('#edit_invalidInputsError').hide();
    let savedPlateId = $('#edit_savedPlateId').val();

    if(window.location.href.includes('/savedPlates/edit/')) {
        let requestConfig = {
            method: 'GET',
            url: '/savedPlates/json/' + savedPlateId
        };
        $.ajax(requestConfig).then(function(response) {
            for(let i = 0; i < response.savedPlate.foods.length; i++) {
                let foodDropdown =
                `<div class="row">
                    <div class="col-8">
                        <select id="edit_food${counter}" class="form-select" aria-label="Select Food">`;
                foodDropdown += $('#edit_foodDropdownTemplate').html();
                foodDropdown +=
                        `</select>
                    </div>
                    <div class="col-4">
                        <label for="edit_servings${counter}" class="visually-hidden">Number of Servings</label>
                        <input id="edit_servings${counter}" class="form-control" value="${response.savedPlate.servings[i]}" placeholder="Number of Servings">
                    </div>
                </div><br>`;
                $('#edit_foodDiv').append(foodDropdown);
                $(`#edit_food${counter}`).val(`${response.savedPlate.foods[i]}`);
                counter += 1;
            }
            calculate();
        });
    }

    $('#edit_addFoodButton').on('click', function(event) {
        $('#edit_invalidInputsError').hide();
        event.preventDefault();
        let foodDropdown =
        `<div class="row">
            <div class="col-8">
                <select id="edit_food${counter}" class="form-select" aria-label="Select Food">`;
        foodDropdown += $('#edit_foodDropdownTemplate').html();
        foodDropdown +=
                `</select>
            </div>
            <div class="col-4">
                <label for="edit_servings${counter}" class="visually-hidden">Number of Servings</label>
                <input id="edit_servings${counter}" class="form-control" placeholder="Number of Servings">
            </div>
        </div><br>`;
        $('#edit_foodDiv').append(foodDropdown);
        counter += 1;
    });

    $('#edit_foodDiv').on('keyup change', function(event) {
        $('#edit_invalidInputsError').hide();
        event.preventDefault();
        calculate();
    });
    
    function calculate() {
        let totalCalories = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        for(let i = 1; i < counter; i++) {
            let foodId = $(`#edit_food${i}`).val();
            let servings = parseFloat($(`#edit_servings${i}`).val());
            if((foodId && typeof foodId === 'string' && foodId.trim() !== '' && foodId !== 'Select a food') 
                && (servings && typeof servings === 'number' && !isNaN(servings) && servings > 0)) {
                let requestConfig = {
                    method: 'GET',
                    url: '/foods/json/' + foodId
                };
                $.ajax(requestConfig).then(function(response) {
                    totalCalories += response.food.calories * servings;
                    totalFat += response.food.fat * servings;
                    totalCarbs += response.food.carbs * servings;
                    totalProtein += response.food.protein * servings;
                    $('#edit_totalCalories').html(Math.round(totalCalories * 10) / 10);
                    $('#edit_totalFat').html(Math.round(totalFat * 10) / 10);
                    $('#edit_totalCarbs').html(Math.round(totalCarbs * 10) / 10);
                    $('#edit_totalProtein').html(Math.round(totalProtein * 10) / 10);
                });
            }
        }
    }

    $('#edit_savePlateButton').on('click', function(event) {
        $('#edit_invalidInputsError').hide();
        let isValid = true;
        event.preventDefault();
        foodArray = [];
        servingArray = [];
        $(`#edit_title`).removeClass('is-valid is-invalid');

        const title = $('#edit_title').val();
        if(!title || typeof title !== 'string' || title.trim() === '') {
            $('#edit_title').focus();
            $(`#edit_title`).addClass('is-invalid');
            isValid = false;
        }
        else {
            $(`#edit_title`).addClass('is-valid');
        }

        for(let i = 1; i < counter; i++) {
            $(`#edit_food${i}`).removeClass('is-valid is-invalid');
            $(`#edit_servings${i}`).removeClass('is-valid is-invalid');
            let foodId = $(`#edit_food${i}`).val();
            let servings = parseFloat($(`#edit_servings${i}`).val());
            if(!foodId || typeof foodId !== 'string' || foodId.trim() === '' || foodId === 'Select a food') {
                $(`#edit_food${i}`).addClass('is-invalid');
                isValid = false;
            }
            else {
                $(`#edit_food${i}`).addClass('is-valid');
                foodArray.push(foodId);
            }
            if(!servings || typeof servings !== 'number' || isNaN(servings) || servings <= 0) {
                $(`#edit_servings${i}`).addClass('is-invalid');
                isValid = false;
            }
            else {
                $(`#edit_servings${i}`).addClass('is-valid');
                servingArray.push(servings);
            }
        }

        if(isValid) {
            $('#edit_invalidInputsError').hide();
            if(foodArray.length > 0 && servingArray.length > 0 && foodArray.length === servingArray.length) {
                const requestConfig = {
                    method: 'PUT',
                    url: '/savedPlates/' + savedPlateId,
                    contentType: 'application/json',
                    data: JSON.stringify({
                        title: title,
                        foods: foodArray,
                        servings: servingArray
                    })
                };
                $.ajax(requestConfig).then(function(response) {
                    if(response.result === 'redirect') {
                        window.location.replace(response.url);
                    }
                });
            }
            else {
                $('#edit_invalidInputsError').show();
                $('#edit_invalidInputsError').html('Error: No foods were selected.');
            }
        }
        else {
            $('#edit_invalidInputsError').show();
            $('#edit_invalidInputsError').html('Error: Invalid input(s).');
        }
    });
})(window.jQuery);