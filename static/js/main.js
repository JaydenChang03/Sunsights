document.addEventListener('DOMContentLoaded', function() {
    const commentInput = document.getElementById('commentInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const singleResult = document.getElementById('singleResult');
    const singleLoading = document.getElementById('singleLoading');
    const fileInput = document.getElementById('fileInput');
    const analyzeBulkBtn = document.getElementById('analyzeBulkBtn');
    const bulkResult = document.getElementById('bulkResult');
    const bulkLoading = document.getElementById('bulkLoading');
    let sentimentChart = null;

    // Single comment analysis
    analyzeBtn.addEventListener('click', async () => {
        const text = commentInput.value.trim();
        if (!text) {
            showToast('Please enter a comment to analyze', 'warning');
            return;
        }

        try {
            singleLoading.classList.add('active');
            singleResult.classList.add('d-none');
            
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            if (response.ok) {
                displaySingleResult(data);
                showToast('Analysis completed successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to analyze comment');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'error');
        } finally {
            singleLoading.classList.remove('active');
        }
    });

    // Bulk analysis
    analyzeBulkBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            showToast('Please select a file to analyze', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            bulkLoading.classList.add('active');
            bulkResult.classList.add('d-none');
            
            const response = await fetch('/analyze-bulk', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                displayBulkResult(data);
                showToast('Bulk analysis completed successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to analyze file');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'error');
        } finally {
            bulkLoading.classList.remove('active');
        }
    });

    function displaySingleResult(data) {
        singleResult.classList.remove('d-none');
        
        // Display emotion category with fade-in animation
        const emotionCategory = singleResult.querySelector('.emotion-category');
        emotionCategory.style.opacity = '0';
        emotionCategory.textContent = data.category;
        emotionCategory.className = 'emotion-category emotion-' + data.category.toLowerCase();
        setTimeout(() => emotionCategory.style.opacity = '1', 100);

        // Display sentiment scores with progress bars
        const scoresHtml = `
            <div class="score-details">
                <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span>Positive</span>
                        <span>${(data.scores.positive * 100).toFixed(1)}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar bg-success" style="width: ${data.scores.positive * 100}%"></div>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span>Neutral</span>
                        <span>${(data.scores.neutral * 100).toFixed(1)}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar bg-warning" style="width: ${data.scores.neutral * 100}%"></div>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span>Negative</span>
                        <span>${(data.scores.negative * 100).toFixed(1)}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar bg-danger" style="width: ${data.scores.negative * 100}%"></div>
                    </div>
                </div>
                <div class="mt-3">
                    <strong>Overall Score: </strong>
                    <span class="badge ${data.scores.compound > 0 ? 'bg-success' : data.scores.compound < 0 ? 'bg-danger' : 'bg-warning'}">
                        ${data.scores.compound.toFixed(3)}
                    </span>
                </div>
            </div>
        `;
        singleResult.querySelector('.sentiment-scores').innerHTML = scoresHtml;

        // Display suggestions with staggered animation
        const suggestionList = singleResult.querySelector('.suggestion-list');
        suggestionList.innerHTML = '';
        data.suggestions.forEach((suggestion, index) => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            li.style.opacity = '0';
            li.style.transform = 'translateX(-20px)';
            suggestionList.appendChild(li);
            
            setTimeout(() => {
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }

    function displayBulkResult(data) {
        bulkResult.classList.remove('d-none');

        // Display summary statistics with animation
        const summaryStats = bulkResult.querySelector('.summary-stats');
        summaryStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-value" data-value="${data.summary.total_comments}">0</div>
                <div class="stat-label">Total Comments</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" data-value="${data.summary.positive_count}">0</div>
                <div class="stat-label">Positive</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" data-value="${data.summary.neutral_count}">0</div>
                <div class="stat-label">Neutral</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" data-value="${data.summary.negative_count}">0</div>
                <div class="stat-label">Negative</div>
            </div>
        `;

        // Animate the numbers
        animateNumbers();

        // Display priority cases with animation
        const priorityList = bulkResult.querySelector('.priority-list');
        priorityList.innerHTML = '';
        
        data.summary.priority_cases.forEach((case_data, index) => {
            const caseElement = document.createElement('div');
            caseElement.className = 'priority-case';
            caseElement.style.opacity = '0';
            caseElement.style.transform = 'translateY(20px)';
            
            caseElement.innerHTML = `
                <div class="mb-2"><strong>Comment:</strong> ${case_data.comment}</div>
                <div class="d-flex justify-content-between align-items-center">
                    <span>
                        <strong>Sentiment:</strong>
                        <span class="badge ${case_data.analysis.category === 'Positive' ? 'bg-success' : 'bg-danger'}">
                            ${case_data.analysis.category}
                        </span>
                    </span>
                    <span>
                        <strong>Score:</strong>
                        <span class="badge bg-danger">${case_data.analysis.scores.compound.toFixed(3)}</span>
                    </span>
                </div>
            `;
            
            priorityList.appendChild(caseElement);
            
            setTimeout(() => {
                caseElement.style.opacity = '1';
                caseElement.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    function animateNumbers() {
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(statValue => {
            const targetValue = parseInt(statValue.dataset.value);
            const duration = 1500; // Animation duration in milliseconds
            const steps = 60; // Number of steps in the animation
            const stepValue = targetValue / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                const currentValue = Math.round(stepValue * currentStep);
                statValue.textContent = currentValue;

                if (currentStep >= steps) {
                    statValue.textContent = targetValue;
                    clearInterval(interval);
                }
            }, duration / steps);
        });
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
        
        const container = document.querySelector('.toast-container');
        container.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
});
