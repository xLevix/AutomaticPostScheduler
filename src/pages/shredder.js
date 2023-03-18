const content = "If you wish to delete your data, please email me at xxleviiplxx@gmail.com ";

export default function Shredder() {
    return (
        <div className="container">
            <main>
                <div className="content">
                    <div className="content__inner">
                        <div className="content__inner__text">
                            <div dangerouslySetInnerHTML={{__html: content}}/>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}