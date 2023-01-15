const schedulerList: any[] = []

export function schedulerJob (job) {
    if (!schedulerList.includes(job)) {
        schedulerList.push(job)
    }
    // Promise.resolve().then(() => {
    //    不能用foreach，每次执行完都要剔除
    //     schedulerList.forEach(job => job && job())
    // })
    executeJobs()
}

export function nextTick (fn) {
    createMicroTask(fn ? fn : () => {} )
}

function createMicroTask (fn) {
    Promise.resolve().then(fn)
}

function executeJobs () {
    let job 
    createMicroTask(() => {
        while ((job = schedulerList.shift())) {
            job && job()
        }
    })
}


