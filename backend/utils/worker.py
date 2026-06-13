from concurrent.futures import ThreadPoolExecutor

# A lightweight local background worker pool for the hackathon MVP
# so you don't need to spin up a full Redis + Celery stack.
# In production, replace this with Celery.
background_pool = ThreadPoolExecutor(max_workers=5)

def run_background_task(task_func, *args, **kwargs):
    """
    Submits a task to be run in the background.
    """
    background_pool.submit(task_func, *args, **kwargs)
