const content = "<p><a href='overview.js'>Logowanie</a></p><p><a href='form.js'>Formularz Linkedin</a> </p>"

export default function Main() {
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