const content = "<h1>Request User Data Deletion</h1><p>If you would like to delete your data, please send an email to xxleviiplxx@gmail.com from the email you used to log in.</p>";

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